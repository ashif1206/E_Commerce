import mongoose from "mongoose";
import { handleResponse } from "../helper/handleResponse.js";
import productModel from "../models/productModel.js";
import { handleQueries } from "../utils/Queries_Handling/handleQueries.js";
import {v2 as cloudinary} from 'cloudinary'

//! get Products API

export const getAllProducts = async (req, res) => {
  try {
    const { products, total } = await handleQueries(req.query);

    if (!products || products.length === 0) {
      return handleResponse(res, 400, {
        success: false,
        message: "Product not Found!!!",
      });
    }

    return handleResponse(res, 200, {
      success: true,
      message: `Total ${products.length} Products`,
      productCount:total,
      currentPage: Number(req.query.page) || 1,
      totalPages: Math.ceil(total / (Number(req.query.limit) || 4)),
      resultsPerPage:req.query.limit || 4,
      products,
    });

  } catch (e) {
    return handleResponse(res, 500, { success: false, message: e.message });
  }
};

//? Create Product API

export const createProduct = async (req, res) => {
  const { name, description, price, category, image,stock } = req.body;
  const {_id} = req.user;
  try {
    if (!name || !description || !price || !category || !stock || !image) {
      return handleResponse(res, 400, {
        success: false,
        message: "All Feilds are required!!!",
      });
    }
    let images =[];
    if(typeof image === "string"){
      images.push(image)
    }else{
      images = image
    };
    let imageLink = [];

    for(let i = 0; i < images.length; i++){
      const result = await cloudinary.uploader.upload(images[i],{
        folder:"Products"
      });
      imageLink.push({
        public_id:result.public_id,
        url:result.secure_url
      })
    }
   

    const product = await productModel({
      name,
      description,
      price,
      image:imageLink,
      category,
      stock,
      user:_id      
    });

    //* we can use productModel.create({});

    if (product) {
      await product.save();

      return handleResponse(res, 201, { success: true, product, });
    } else {
      return handleResponse(res, 400, {
        success: false,
        message: "Something went wrong and Product not created!!!",
      });
    }
  } catch (e) {
    return handleResponse(res, 500, { success: false, message: e.message });
  }
};

//? Update Product API

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleResponse(res, 400, {
        success: false,
        message: "Id is Incorrect!!!",
      });
    }
    let product = await productModel.findById(id);

    if (!product) {
      return handleResponse(res, 400, {
        success: false,
        message: "Product Not Updated or or id is not correct or something went wrong!!!",
      });
    };
    let images =[];
    if(typeof req.body.image === "string"){
      images.push(req.body.image)
    }else if (Array.isArray(req.body.image)) {
        images = req.body.image;
    };

    if(images.length > 0){
      for (let i = 0; i < product.image.length;i++){
        await cloudinary.uploader.destroy(product.image[i].public_id)
      };
      let imageLink = [];
      for(let i = 0; i < images.length; i++){
        const result = await cloudinary.uploader.upload(images[i],{folder:"Products"});
        imageLink.push({
          public_id:result.public_id,
          url:result.secure_url
        });
      };
      req.body.image = imageLink;
    }

    product = await productModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });


    return handleResponse(res, 200, { success: true, product });
  } catch (e) {
    return handleResponse(res, 500, { success: false, message: e.message });
  }
};

// !Delete All Products
export const deleteAllProducts = async(req,res)=>{
  try{
    await productModel.deleteMany();
    return handleResponse(res,200,{success:true,message:"All products delete succesfully"})
  }catch(e){
    return handleResponse(res,500,{success:false,message:e.message});
  }
};
//! Delete Product API

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleResponse(res, 400, {
        success: false,
        message: "Id is Incorrect!!!",
      });
    }

    const product = await productModel.findByIdAndDelete(id);

    if (!product) {
      return handleResponse(res, 400, {
        success: false,
        message: "Something went wrong!!!",
      });
    }
    for(let i = 0; i < product.image.length; i++){
      await cloudinary.uploader.destroy(product.image[i].public_id);
    };
    
    return handleResponse(res, 200, {
      success: true,
      message: "Product Deleted Successfully!!!",
    });
  } catch (e) {
    return handleResponse(res, 500, { success: false, message: e.message });
  }
};

//* get Single Product

export const getSingleProduct = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleResponse(res, 400, {
        success: false,
        message: "Id is Incorrect",
      });
    }

    const product = await productModel.findById(id);

    return handleResponse(res, 200, { success: true, product });
  } catch (e) {
    return handleResponse(res, 500, { success: false, message: e.message });
  }
};

//? ADMIN GET ALL PRODUCTS

export const adminGetAllProducts = async (req,res)=>{
  try{
    const product = await productModel.find();
    if(!product){
      return handleResponse(res,400,{success:false,message:"Something went wrong!!!"});
    };
    const totalProduct = await productModel.find().countDocuments();
return handleResponse(res,200,{success:true,totalProduct,product});

  }catch(e){
    return handleResponse(res,500,{success:false,message:e.message});
  }
};

//? ADMIN GET SINGLE PRODUCTS
export const adminGetSingleProduct = async (req,res)=>{
  const {id} = req.params;
  try{

    if(!id || !mongoose.isValidObjectId(id)){
      return handleResponse(res,400,{success:false,message:"something went wrong or product not found or Id not correct!!!"});
    };

    const product = await productModel.findById(id);
    if(!product){
       return handleResponse(res,400,{success:false,message:"something went wrong or product not found!!!"});
    };

    return handleResponse(res,200,{success:true,product})

  }catch(e){
    return handleResponse(res,500,{success:false,message:e.message});
  };
};


export const updateReview = async (req,res)=>{
  const {id,name} = req.user;
  const {productId,comment,rating} = req.body;
  try{
    if(!id || !mongoose.isValidObjectId(id)){
      return handleResponse(res,400,{success:false,message:"Something went wrong or id is Invalid"});
    };
    const review = {
      user:id,
      name,
      rating:Number(rating),
      comment,
    };

    const product = await productModel.findById(productId);
    if(!product){
      return handleResponse(res,400,{success:false,message:"Something went wrong or product not found"});
    };

    const isReviewExists = product.review.find((review)=>review.user.toString() === id.toString());

    if(isReviewExists){
      product.review.forEach((review)=>{
        if(review.user.toString() === id.toString()){
          review.rating = rating;
          review.comment = comment;
        };
      });
    }else{
      product.review.push(review);
      product.numOfReviews = product.review.length;
    };

    let sum = 0;
    product.review.forEach((review)=>{
      sum += review.rating;
    });

    product.rating = sum / product.review.length

    await product.save({validateBeforeSave:false});
    return handleResponse(res,200,{success:true,product});

  }catch(e){
    return handleResponse(res,500,{success:false,message:e.message});
  }
};

export const getProductReviews = async (req,res)=>{
  const {productId} = req.query;
  try{
    if(!productId || !mongoose.isValidObjectId(productId)){
      return handleQueries(res,400,{success:false,message:"Something went wrong or Id not found"});
    };

    const product = await productModel.findById(productId);

    if(!product){
      return handleQueries(res,400,{success:false,message:"Something went wrong or Product not found"});
    };

    return handleResponse(res,200,{success:true,reviews:product.review});

  }catch(e){
    return handleQueries(res,500,{success:false,message:e.message});
  }
};

export const deleteProductReview = async (req,res)=>{
  const {productId,id}=req.query;
  try{

    if(!productId || !id || !mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(productId)){
      return handleResponse(res,400,{success:false,message:"Something went wrong or id not correct or not found"});
    };

    const product = await productModel.findById(productId);

    if(!product){
      return handleResponse(res,400,{success:false,message:"Something went wrong or product not found"});
    };

    const review = product.review.filter((review)=>review._id.toString() !== id.toString());
    let sum = 0;

    review.forEach((review)=>{
      sum += review.rating;
    });

    const rating = review.length > 0 ? sum / review.length : 0 ;
    const numOfReviews = review.length;

    await productModel.findByIdAndUpdate(productId,{review,rating,numOfReviews},{new:true,runValidators:true});
    
    return handleResponse(res,200,{success:true,message:"Review deleted successfully"});

  }catch(e){
    return handleResponse(res,500,{success:false,message:e.message});
  }
};