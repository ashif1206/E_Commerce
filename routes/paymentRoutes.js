import express from 'express'
import { userAuth } from '../middleware/userAuth.js';
import { paymentVerification, processPayment, sendApiKey } from '../controller/paymentController.js';

const paymentRouter = express.Router();

paymentRouter.route("/payment/process").post(userAuth,processPayment);
paymentRouter.route("/getapikey").get(userAuth,sendApiKey);
paymentRouter.route("/paymentverification").post(paymentVerification);

export default paymentRouter