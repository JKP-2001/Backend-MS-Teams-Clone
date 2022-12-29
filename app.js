import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
const app = express();

app.use((req,res,next)=>{
    if(req.originalMethod!=="GET" && req.headers["security-key"]!==process.env.SECURITY_KEY){
        res.json({msg:"You Are Not Authorized"});
        return;
    }
    next();
})



const runApp = () => {

    mongoose.set('strictQuery', false);

    const url = "mongodb+srv://jkp6957:" + process.env.mongopass + "@cluster0.ncrzato.mongodb.net/?retryWrites=true&w=majority"

    mongoose.connect(url, (err, res) => {
        //console.log(err, res);
        console.log("connected to mongodb");
    });
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, ()=>{
        console.log(`App Listening To Port ${PORT}`)
    })
}

runApp();
