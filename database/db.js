import mongoose from "mongoose";
import  'dotenv/config'


const str = process.env.DBCONNECTSTR

async function dbConnectFnc() {
    try{
        if(str){
            const conn = await mongoose.connect(str)
            if(conn){
                console.log("MongoDB Connected Successfully!!!")
            }
        }

    }catch(e){
        return console.log("Db is not connecting something went wrong",e.message)
    }
};

export default dbConnectFnc;