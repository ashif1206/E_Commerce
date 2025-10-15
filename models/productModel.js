import mongoose, { model, Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Enter Product Name"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Enter Product Description"],
    },

    price: {
      type: Number,
      required: [true, "Enter Product Price"],
      maxLength: [7, "Price cannot exceed 7 digits"],
    },

    rating: {
      type: Number,
      default: 0,
    },

    image: [
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
    ],

    category: {
      type: String,
      required: [true, "Enter Product Description"],
    },

    stock: {
      type: Number,
      required: true,
      maxLength: [5, "Stock Cannot exceed 5"],
      default: 1,
    },

    numOfReviews: {
      type: Number,
      default: 0,
    },

    review: [
      {
        user:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"User",
          required:true
        },
        name: {
          type: String,
          required: true,
        },

        rating: {
          type: Number,
          required: true,
        },

        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    }
  },
  { timestamps: true }
);



const productModel = new model("product", productSchema);

export default productModel;
