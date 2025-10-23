import { handleResponse } from "../helper/handleResponse.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import userModel from "../models/userModel.js";
import { generateToken } from "../jwt/generateToken.js";
import "dotenv/config";
import mongoose from "mongoose";
import { sendMail } from "../utils/mail/sendMail.js";
import {v2 as cloudinary} from 'cloudinary';

// ! Register User

export const registerUser = async (req, res) => {
  const { name, email, password,avatar } = req.body;
  
  try {
    if (!name || !email || !password) {
      return handleResponse(res, 400, {
        success: false,
        message: "All fields are required!!!",
      });
    };

    if(typeof(name) !== "string" ||typeof(email) !== "string" || typeof(password) !== "string"){
        return handleResponse(res,400,{success:false,message:"Invalid Format"})
    };

    if (password.length < 6 || name.length < 4) {
      return handleResponse(res, 400, {
        success: false,
        message: "Password should have atleast 6 character and Name should have atleast 4 character!!!",
      });
    }

    let user = await userModel.findOne({ email });

    if (user) {
      return handleResponse(res, 400, {
        success: false,
        message: "User already exists!!!",
      });
    };
      const myCloud = await cloudinary.uploader.upload(avatar, {
        folder: "avatars",
        crop: "scale",
        width: 150,
      });
      

    user = await userModel({ name, email, password,avatar:{
        public_id:myCloud.public_id,
        url:myCloud.secure_url,
    } });

     try {
      await user.save();
    } catch (saveError) {
      await cloudinary.uploader.destroy(myCloud.public_id);
      return handleResponse(res, 500, {
        success: false,
        message: "Failed to save user. Please try again.",
      });
    }
    const token = generateToken(user._id)
    return handleResponse(res, 201, {
      success: true,
      message: "User Registered Successfully!!!!",
      user,
      token
    });
  } catch (e) {
    return handleResponse(res, 500, { success: false, message: e.message });
  }
};

//? Login User

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return handleResponse(res, 400, {
        success: false,
        message: "All fields are required!!!",
      });
    };

    if(typeof(email) !== "string" || typeof(password) !== "string"){
        return handleResponse(res,400,{success:false,message:"Invalid Format"})
    };

    let user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return handleResponse(res, 400, {
        success: false,
        message: "User Not Found!!!",
      });
    }

    let matchPassword = await bcryptjs.compare(password, user.password);

    if (!matchPassword) {
      return handleResponse(res, 401, {
        success: false,
        message: "Creadential Error",
      });
    }
    const token = generateToken(user._id);
    res.cookie("token",token,{maxAge:process.env.EXPIRE_COOKIE*24*60*60*1000,httpOnly:true});
    // res.cookie("token",token,{maxAge:300000,httpOnly:true});
  
    return handleResponse(res, 200, {
      success: true,
      message: "User LoggedIn Succefully!!!", //3*60
      user,
      token
    });
  } catch (e) {
    return handleResponse(res, 500, { success: false, message: e.message });
  }
};

//! LogOut User

export const logOutUser = async(req,res)=>{
  try{
    res.clearCookie("token");
    return handleResponse(res,200,{success:true,message:'User logged Out Successfully!!!'});
  }catch(e){
    return handleResponse(res,500,{success:false,Error:"Logout not successfull something wnet wrong",message:e.message});
  };
};

//? Forget Password

export const forgotPassword = async (req,res)=>{
  const {email} = req.body;
  try{
    if(!email){
      return handleResponse(res,400,{success:false,message:"Something went wrong aur email not found"});
    };

    const user = await userModel.findOne({email});
    if(!user){
      return handleResponse(res,400,{success:false,message:"User Not Found"});
    };
    
    const generateToken = user.generateResetToken();

    await user.save({validateBeforeSave:false});

    const resetURL = `${req.protocol}://${req.get("host")}/reset/password/${generateToken}`;

    const message = `Use the following link to reset your password: ${resetURL} \n\n
    This link will expire in 30 minutes.\n\n If you didn't request,Please ignore this message.`

      await sendMail({
        email:user.email,
        subject:"Reset Password request",
        message
      });

    return handleResponse(res,200,{success:true,message:`Email sent to ${user.email} successfully`,resetURL});
    // return handleResponse(res,200,{success:true,data:user,resetURL});

  }catch(e){
    return handleResponse(res,500,{success:false,message:"Email could not sent, Please try again later!!!",Error:e.message});
  };
};

//! Reset Password

export const resetPassword = async (req,res)=>{
  const {token} = req.params;
  const {password,confirmPassword} = req.body;
  try{

    if(!token){
      return handleResponse(res,400,{success:false,message:"Something went wrong or token not found"});
    };

    if(!password || typeof(password) !=="string" || password.length < 6){
      return handleResponse(res,400,{success:false,message:"Password must be at least 6 characters"});
    };
    
    if(password !== confirmPassword){
      return handleResponse(res,400,{success:false,message:"Paaword doesn't match"});
    };

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest("hex");

    const user = await userModel.findOne({
      resetPasswordToken,
      resetPasswordExpire:{$gt:Date.now()}
    });

    if(!user){
      return handleResponse(res,400,{success:false,message:"Token Invalid or expire"});
    };

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return handleResponse(res,200,{success:true,message:"Password successfully Updated"});

  }catch(e){
    return handleResponse(res,500,{success:false,message:e.message});
  };
};

//! GET USER Details

export const getUserDetails = async (req,res)=>{
  const {id} = req.user;
  try{
    if(!id){
      return handleResponse(res,400,{success:false,message:"ID is not valid or ID not found!!!"});
    };

    const user = await userModel.findById(id);
     if(!user){
      return handleResponse(res,400,{success:false,message:"Something went wrong!!!"});
     };

     return handleResponse(res,200,{success:true,user});

  }catch(e){
    return handleResponse(res,500,{success:false,message:e.message});
  }
};

//? UPDATE USER PASSWORD

export const updatePassword = async (req,res)=>{
  const {id} = req.user;
  const {oldPassword,newPassword,confirmNewPassword} = req.body;
   try{
        if(!id){
          return handleResponse(res,400,{success:false,message:"Something went wrong!!!"});
        };
        let user = await userModel.findById(id).select("+password");

        if(!user){
          return handleResponse(res,400,{success:false,message:"Somethin went wrong or user not find!!!"});
        };

        const isMatchPass = await bcryptjs.compare(oldPassword,user.password);
        if(!isMatchPass){
          return handleResponse(res,400,{success:false,message:"Old Password doesn't match!!!"});
        };

        if(newPassword !== confirmNewPassword){
          return handleResponse(res,400,{success:false,message:"Password doesn't match!!! Please enter coreect password."});
        };



        user.password = newPassword;
        await user.save();
        const token = generateToken(user._id);
        return handleResponse(res,200,{success:true,user,token});
  }catch(e){
    return handleResponse(res,500,{success:false,message:e.message});
  }
};

//! UPDATE USER PROFILE

export const updateProfile = async(req,res)=>{
  const {id} = req.user;
  const {name,email,avatar,role}= req.body;

  try{

    if(!id){
      return handleResponse(res,400,{success:false,message:"Something went wrong!!!"});
    };
    const updateUserDetails =  {
        name: name ,
        email: email,
        role: role,
      };
    const isEmailExist = await userModel.findOne({email});
    if (isEmailExist) {
      return handleResponse(res, 400, {
        success: false,
        message: "Email already registered",
      });
    };

    if(avatar !== ""){
      const user = await userModel.findById(id);
      const imageId = user.avatar.public_id;
      await cloudinary.uploader.destroy(imageId);
      const myCloud = await cloudinary.uploader.upload(avatar,{
         folder: "avatars",
        crop: "scale",
        width: 150,
      });

      updateUserDetails.avatar = {
        public_id:myCloud.public_id,
        url:myCloud.secure_url,
      }

    };
    const user = await userModel.findByIdAndUpdate(
      id,
     updateUserDetails,
      { new: true, runValidators: true }
    );
    
    if(!user){
      return handleResponse(res,400,{success:false,message:"Something went wrong or user details could not updated!!!"});
    };

    return handleResponse(res,200,{success:true,user});

  }catch(e){
    console.log(e.message)
    return handleResponse(res,400,{success:false,message:e.message});
  }
};

//? ADMIN GET SINGLE USER

export const adminGetSingleUser = async (req,res)=>{
  const {id} = req.params;
  try{
    if(!id || !mongoose.isValidObjectId(id)){
      return handleResponse(res,400,{success:false,message:"Something went wrong!!! or id not found or not correct"});
    };

    const user = await userModel.findById(id);
    if(!user){
      return handleResponse(res,400,{success:false,message:"Something went wrong!!! or User not found"});
    };

    return handleResponse(res,200,{success:true,user});

  }catch(e){
    return handleResponse(res,500,{success:false,message:e.message});
  }
};

//? ADMIN GET ALL USERS

export const adminGetAllUsers = async (req,res)=>{
  try{
    const users = await userModel.find();
    if(!users){
      return handleResponse(res,400,{success:false,message:"Something went wrong!!!"});
    };

    const totalUser = await userModel.find().countDocuments();

    return handleResponse(res,200,{success:true,totalUser,users});
  }catch(e){
    return handleResponse(res,500,{success:false,message:e.message});
  }
};

//? ADMIN DELETE USERS
export const adminDeleteUser = async (req,res)=>{
  const {id} = req.params;
  try{
    if(!id || !mongoose.isValidObjectId(id)){
    return handleResponse(res,400,{success:false,message:"Something went wrong or id not found or not correct"});
    };
    const user = await userModel.findById(id);
    if(!user){
      return handleResponse(res,400,{success:false,message:"Something went wrong or user not found"});
    };
    const userImageID = user.avatar.public_id;
    await cloudinary.uploader.destroy(userImageID);
    await userModel.findByIdAndDelete(id);
    return handleResponse(res,200,{success:true,message:"User deleted succssfully!!!"});
  }catch(e){
    return handleResponse(res,500,{success:false,message:e.message});
  };
};

//? ADMIN UPDATE USER PROFILE USERS
export const adminUpdateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  try {
    if (!id) {
      return handleResponse(res, 400, {
        success: false,
        message: "Something went wrong!!!",
      });
    }
    const isUser = await userModel.findById(id);
    if (!isUser) {
      return handleResponse(res, 400, {
        success: false,
        message: "Something went wrong or User not found!!!",
      });
    }
    const user = await userModel.findByIdAndUpdate(
      id,
      {
        name: name || isUser.name,
        email: email || isUser.email,
        role: role || isUser.role,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return handleResponse(res, 400, {
        success: false,
        message: "Something went wrong or user details could not updated!!!",
      });
    }

    return handleResponse(res, 200, { success: true, user });
  } catch (e) {
    return handleResponse(res, 400, { success: false, message: e.message });
  }
};
