import mongoose, { model, Schema } from "mongoose";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import validator from "validator"

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
        maxLength:[25,"Name should not exceed 25 Character"],
        minLength:[3,"Name should be greater than 3 character"]
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate:[validator.isEmail,"Enter Valid Email"]
    },
    password:{
        type:String,
        required:true,
        select:false,
        minLength:[6,"Password should have atleast 6 character"]
    },
    avatar: 
      {
        public_id: {
          type: String,
          required: true,
        },

        url: {
          type: String,
          required: true,
        },
      },
    role:{
        type:String,
        default:"User"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
},{timestamps:true});

userSchema.pre("save", async function (next){

  if(!this.isModified("password")){
    return next();
  };

  this.password = await bcryptjs.hash(this.password, 12);
  next()
});

userSchema.methods.generateResetToken = function (){

  const generateToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash('sha256').update(generateToken).digest("hex");
  this.resetPasswordExpire = Date.now()+30*60*1000;
  return generateToken;
};


const userModel =  model("User",userSchema);

export default userModel;