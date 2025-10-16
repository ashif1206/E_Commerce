import { handleResponse } from "../helper/handleResponse.js";
import "dotenv/config";
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { instance } from "../server.js";

export const processPayment = async (req,res)=>{
     try{
   
        const options ={
            amount:Number(req.body.amount * 100),
            currency:"INR"
        };
        const order = await instance.orders.create(options);
        return handleResponse(res,200,{success:true,order});
    }catch(e){
        return handleResponse(res,500,{success:false,message:e.message})
    }
};

export const sendApiKey = async (req,res)=>{
    try{
        return handleResponse(res,200,{success:true,key:process.env.RAZORPAY_API_KEY});
    }catch(e){
        return handleResponse(res,500,{success:false,message:e.message})
    }
};

export const paymentVerification = async (req,res)=>{
    const {razorpay_payment_id,razorpay_order_id,razorpay_signature}= req.body;
    try{
        const body = razorpay_order_id +"|"+ razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256',process.env.RAZORPAY_API_SECRET).update(body.toString()).digest("hex");
        const isAuthentic = expectedSignature === razorpay_signature ;
        if(isAuthentic){
             return handleResponse(res,200,{success:true,message:"Payment verified successfully",reference:razorpay_payment_id});
        }else{
             return handleResponse(res,500,{success:false,message:"Payment verified failed"});
        }
    }catch(e){
         return handleResponse(res,500,{success:false,message:e.message})
    }
};