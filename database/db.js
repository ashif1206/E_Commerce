import mongoose from "mongoose";

const str = process.env.DBCONNECTSTR

async function dbConnectFnc() {
    try{
        if(str){
            console.log("Hello")
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