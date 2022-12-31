import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = async (req,res,next)=>{
    try{
        const token = req.headers["auth-token"];
        if(!token){
            throw new Error("Token Not Found");
        }
        const decode = jwt.verify(token,JWT_SECRET);
        req.user = decode.user;
        next();

    }catch(err){
        res.status(404).json({success:false, "error":err.toString()});
    }
}


export {fetchUser};