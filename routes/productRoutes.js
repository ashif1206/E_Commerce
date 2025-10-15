import express from "express"
import { adminGetAllProducts, adminGetSingleProduct, createProduct, deleteAllProducts, deleteProduct, deleteProductReview, getAllProducts, getProductReviews, getSingleProduct, updateProduct, updateReview } from "../controller/productController.js";
import { roleBasedAccess, userAuth } from "../middleware/userAuth.js";

const productRoutes = express.Router();

productRoutes.route("/products").get(getAllProducts);
productRoutes.route("/product/:id").get(getSingleProduct);

productRoutes.route("/admin/product/delete").delete(deleteAllProducts);

productRoutes.route("/admin/product/create")
.post(userAuth,roleBasedAccess,createProduct);

productRoutes.route("/admin/products").get(userAuth,roleBasedAccess,adminGetAllProducts);

productRoutes.route("/admin/product/:id")
.get(userAuth,roleBasedAccess,adminGetSingleProduct)
.put(userAuth,roleBasedAccess,updateProduct)
.delete(userAuth,roleBasedAccess,deleteProduct);

productRoutes.route("/review").put(userAuth,updateReview);

productRoutes.route("/admin/reviews")
.get(userAuth,roleBasedAccess,getProductReviews)
.delete(userAuth,roleBasedAccess,deleteProductReview);


export default productRoutes;