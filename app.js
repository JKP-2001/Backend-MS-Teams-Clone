import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import authRouter from "./Routes/AuthRoute.js";

const BASE_URL = process.env.BASE_URL;

const app = express();
app.use(express.json());

app.use((req,res,next)=>{
    if(req.originalMethod!=="GET" && req.headers["security-key"]!==process.env.SECURITY_KEY){
        res.json({msg:"You Are Not Authorized"});
        return;
    }
    next();
})

app.use(BASE_URL, authRouter);

const runApp = () => {

    mongoose.set('strictQuery', false);

    const url = "mongodb+srv://"+process.env.mongo_user+":"+process.env.mongopass+"@cluster0.ncrzato.mongodb.net/Clone?retryWrites=true&w=majority";

    mongoose.connect(url, (err, res) => {
        //console.log(err, res);
        console.log("connected to mongodb");
    });
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, ()=>{
        console.log(`App Listening To Port ${PORT}`)
    })
}

runApp();
