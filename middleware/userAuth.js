import jwt from "jsonwebtoken"
import { handleResponse } from "../helper/handleResponse.js";
import  'dotenv/config'
import userModel from "../models/userModel.js";

export const userAuth = async(req,res,next)=>{
    const {token} = req.cookies;
    try{
        if(!token){
            return handleResponse(res,400,{success:false,message:"Loggin First"});
        };

        const decode =  jwt.verify(token,process.env.JWT_SECRET_KEY)
       if(!decode){
        return handleResponse(res,400,{success:false,message:"something went wrong"})
       };
       req.user = await userModel.findById(decode.id);
       next();

    }catch(e){
        return handleResponse(res,500,{success:false,message:e.message});
    };
};

export const roleBasedAccess = async(req,res,next)=>{
    const {token} = req.cookies;
    try{

        if(!token){
            return handleResponse(res,400,{success:false,message:"Something went wrong!!!"});
        };

        const decode =  jwt.verify(token,process.env.JWT_SECRET_KEY);

        const user = await userModel.findById(decode.id);

        if(!user){
            return handleResponse(res,400,{success:false,message:"Something went wrong"})
        };

        if(user.role !== "Admin"){
            return handleResponse(res,403,{success:false,message:"You are not allowed"});
        };
        next();

    }catch(e){
        return handleResponse(res,500,{success:false,message:"You are not authorized Admin Only", Error:e.message});
    }
};