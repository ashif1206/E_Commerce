import express from "express";
import { adminDeleteOrder, adminGetAllOrders, adminGetSingleOrder, adminUpdateOrderStatus, allMyOrders, createNewOrder, getSingleOrder } from "../controller/orderController.js";
import { roleBasedAccess, userAuth } from "../middleware/userAuth.js";

const orderRouter = express.Router();

orderRouter.route("/new/order").post(userAuth,createNewOrder);
orderRouter.route("/orders/user").get(userAuth,allMyOrders);

orderRouter.route("/admin/orders").get(userAuth,roleBasedAccess,adminGetAllOrders);
orderRouter.route("/order/:id").get(userAuth,getSingleOrder);

orderRouter.route("/admin/order/:id")
.get(userAuth,roleBasedAccess,adminGetSingleOrder)
.put(userAuth,roleBasedAccess,adminUpdateOrderStatus)
.delete(userAuth,roleBasedAccess,adminDeleteOrder)

export default orderRouter