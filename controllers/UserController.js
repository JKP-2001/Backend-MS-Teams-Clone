import dotenv from "dotenv";
dotenv.config();
import { User } from "../models/User.js";

const fetchKeywordUser = async(req,res)=>{
    try{
        let keyword=req.body.keyword;
        if(keyword.length===0)
        {
            res.status(200).json({success:true,users:[]});
            return ;
        }
        let users=await User.find().select("_id firstName lastName");
        let result=[];
        for(let i=0;i<users.length;i++)
        {
            let a=users[i].firstName.toLowerCase();
            let b=users[i].lastName.toLowerCase();
            let k=keyword.toLowerCase();
            if(a.includes(k)||b.includes(k))
            {
                result.push(users[i]);
            }
        }
        res.status(200).json({success:true,users:result});
    }
    catch(error)
    {
        res.status(400).json({ success: false, message: error.toString() });
    }
}

export {fetchKeywordUser};