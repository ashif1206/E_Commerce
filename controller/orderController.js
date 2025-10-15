import mongoose from "mongoose";
import { handleResponse } from "../helper/handleResponse.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

//? Create New Order
export const createNewOrder = async (req,res)=>{
    const {shippingInfo,orderItems,paymentInfo,itemPrice,shippingPrice,taxPrice,totalPrice} = req.body;
    try{
        const order = await orderModel({
          shippingInfo,
          orderItems,
          paymentInfo,
          itemPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
          paidAt:Date.now(),
          user:req.user._id
        });
        if(!order){
            return handleResponse(res,400,{success:false,message:"Something went wrong or Order not created"});
        };
        await order.save();
        return handleResponse(res,201,{success:true,Order:order});
    }catch(e){
        return handleResponse(res,500,{success:false,message:e.message});
    }
};

//? ALL MY ORDERS
export const allMyOrders = async (req,res)=>{
    const {id} = req.user;
    try{
        if(!id || !mongoose.isValidObjectId(id)){
            return handleResponse(res,400,{success:false,message:"Something wnet wrong or Id not corrected"});
        };

        const orders = await orderModel.find({user:id});
        if(!orders){
            return handleResponse(res,400,{success:false,message:"Something went wrong or Order not found"});
        };

        if(orders.length == 0){
            return handleResponse(res,200,{success:false,totalOrders:orders.length,message:"You have not placed any order yet."});
        };

        return handleResponse(res,200,{success:true,totalOrders:orders.length,orders});

    }catch(e){
        return handleResponse(res,500,{success:false,message:e.message});
    };
};

//? GET SINGLE ORDER

export const getSingleOrder = async (req,res)=>{
    const {id} = req.params;
    try{
        if(!id || !mongoose.isValidObjectId(id)){
            return handleResponse(res,400,{success:false,message:"Something went wrong or Id is not found or not correct"});
        };

        const order = await orderModel.findById(id).populate("user","name email");
        if(!order){
            return handleResponse(res,404,{success:false,message:"Order not found"});
        };

        return handleResponse(res,200,{success:true,order});

    }catch(e){
        return handleResponse(res,500,{success:false,message:e.message});
    };
};

//! ADMIN Get All Orders
export const adminGetAllOrders = async (req,res)=>{
    try{
        const orders = await orderModel.find().populate("user","name email");
        if(!orders){
            return handleResponse(res,400,{success:false,message:"Something went wrong or Orders not founds"});
        };
        let totalAmount = 0;
        orders.forEach((items)=>{
            totalAmount += items.totalPrice;
        })
        if(orders.length == 0){
            return handleResponse(res,400,{success:false,message:"Order has not placed yet."})
        }

        return handleResponse(res,200,{success:true,totalOrders:orders.length,totalAmount,orders});
    }catch(e){
        return handleResponse(res,500,{success:false,message:e.message});
    };
};

//! Admin Get Single Order
export const adminGetSingleOrder = async (req,res)=>{
    const {id} = req.params;
    try{
        if(!id || !mongoose.isValidObjectId(id)){
            return handleResponse(res,400,{success:false,message:"Something wnet worng or Id is not found or not correct"});
        };

        const order = await orderModel.findById(id).populate("user","name email");
        if(!order){
            return handleResponse(res,404,{success:false,message:"Order not found"});
        };

        return handleResponse(res,200,{success:true,order});

    }catch(e){
        return handleResponse(res,500,{success:false,message:e.message});
    };
};

//! Admin Update Order Status
export const adminUpdateOrderStatus = async (req,res)=>{
    const {id} = req.params;
    const {status}=req.body;
    try{
        if(!id || !mongoose.isValidObjectId(id)){
            return handleResponse(res,400,{success:false,message:"Something went wrong or Id is not correct or not found"});
        };

        const order = await orderModel.findById(id);
        if(!order){
            return  handleResponse(res,400,{success:false,message:"Something went wrong or order not found"});
        };
        if(order.orderStatus === "Delivered"){
            return handleResponse(res,400,{success:false,message:"Item has been Delivered Successfully"});
        };
        
        await Promise.all(order.orderItems.map((items)=>updateOrderStatus(items.product,items.quantity)));
        
        order.orderStatus = status;

        if(order.orderStatus === "Delivered"){
            order.deliveredAt = Date.now();
        };
        await order.save({validateBeforeSave:false});
        return handleResponse(res,200,{success:true,message:"Order Status Updated successfully",order});

    }catch(e){
        return handleResponse(res,500,{success:false,message:e.message});
    };
};

async function updateOrderStatus(id,quantity){
    const product = await productModel.findById(id);
    if(!product){
         throw new Error("Product not found"); 
    };
    product.stock -= quantity;
    await product.save({validateBeforeSave:false});
}

//! Admin Delete Order
export const adminDeleteOrder = async (req,res)=>{
    const {id} = req.params;
    try{
        if(!id || !mongoose.isValidObjectId(id)){
            return handleResponse(res,400,{success:false,message:"Something went wrong or id is invalid or not found"});
        };
        const order = await orderModel.findById(id);
        if(!order){
            return handleResponse(res,400,{success:false,message:"Order not found"});
        };

        if(order.orderStatus !== "Delivered"){
            return handleResponse(res,400,{success:false,message:"Order is under process, Can't delete order"});
        };

        await orderModel.deleteOne({_id:id});
        return handleResponse(res,200,{success:true,message:"Order Deleted successfully"});

    }catch(e){
        return handleResponse(res,500,{success:false,message:e.message});
    };
};

