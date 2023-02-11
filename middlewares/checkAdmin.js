import mongoose from "mongoose";
import { groupModel } from "../Models/Group.js";
import { User } from "../models/User.js";


const checkAdmin = async(req,res,next)=>{
    try{
        const loggeduser = req.user;
        const user = await User.findOne({email:loggeduser.email});
        if(!user){
            throw new Error("User Not Found");
        }
        
        const grpId = req.body.grp_id;
        console.log({grpId});
        const grp = await groupModel.findById(grpId);
        if(!grp){
            throw new Error("Grp Not Found");
        }
        
        if(String(grp.owner) !== String(user._id) && !grp.admins.includes(user._id)){
            throw new Error("You are not an admin.");
        }

        req.body.groupDetails = grp;
        req.body.userDetails = user;
        next();

    }catch(err){
        res.status(400).json({success:false, error:err.toString()})
    }
}


export default checkAdmin;