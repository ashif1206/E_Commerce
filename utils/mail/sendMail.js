import {createTransport} from "nodemailer";
import  'dotenv/config'

const transport = createTransport({
        host:process.env.HOST,
        port:process.env.MAILPORT,
        auth:{
            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASS
        },
        secure:false,
    });

export const sendMail = async (options)=>{

       const mailOption = {
        from:process.env.SMTP_USER,
        to:options.email,
        subject:options.subject,
        html:options.message
    };

   transport.sendMail(mailOption,(err)=>{
        if(err){
          return  console.log(err.message)
        };
        console.log("Connected and mail sent")
    });
}