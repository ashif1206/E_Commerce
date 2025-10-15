import express from 'express'
// import  'dotenv/config'
import dbConnectFnc from './database/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from 'cloudinary';
import fileupload from 'express-fileupload';
import Razorpay from 'razorpay'
import paymentRouter from './routes/paymentRoutes.js';
import path from 'path';
import {fileURLToPath} from 'url';
import dotenv from "dotenv";


const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);

const app = express();

const PORT = process.env.PORT || 4000  ;


cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
});

app.use(fileupload());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/api/v1",productRoutes);
app.use("/api/v1",userRoutes);
app.use("/api/v1",orderRouter);
app.use("/api/v1",paymentRouter);

app.use(express.static(path.join(__dirname,'../frontEnd/dist')));
app.get(/.*/,(_,res)=>{
    res.sendFile(path.resolve(__dirname,'../frontEnd/dist/index.html'));
});

console.log(process.env.RAZORPAY_API_KEY)
console.log(process.env.RAZORPAY_API_SECRET)

export const instance = new Razorpay({
    key_id:"hello",
    key_secret:"hel123"
});

if(process.env.NODE_ENV !== "PRODUCTION"){
    dotenv.config({ path: path.resolve(__dirname, ".env") });
}

const server = app.listen(PORT,()=>{
    dbConnectFnc()
    console.log(`Server is Running on Port http://localhost:${PORT}`)
});

process.on("uncaughtException",(e)=>{
    console.log(`Error: ${e.message}`);
    console.log(`Server is shutting down due to uncaught exception errors!!!`);
    process.exit(1);
})

process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Server is shutting down due to unhandle promise rejection!!!`);
    server.close(()=>{
        process.exit(1);
    });
});