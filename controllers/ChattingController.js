import {Conversations} from "../models/Conversation.js";
import {Messages} from "../models/Message.js";
import { User } from "../models/User.js";




const getConversation=async (req,res)=>{
    try{
        const currUser=await User.findOne({email:req.user.email});
        const userid= req.params.id;
        const conv=await Conversations.findOne({members:{$all:[currUser.id,userid]}});
        if(conv)
        {
            res.status(200).json({success:true,conversation:conv,message:"already created"});
            return ;
        }
        else
        {
            const c=new Conversations({
                members:[currUser.id,userid]
            })
            await c.save();
            res.status(200).json({success:true,conversation:c,message:"newly created"});
            return ;
        }
    }
    catch(err) 
    {
        res.status(400).json({success:false,message:err.toString()});
    }
}


const getAllConversations=async (req,res)=>{
    try{
        const currUser=await User.findOne({email:req.user.email});
        const allConversations = await Conversations.find({members:currUser.id});
        let ac= await Promise.all( allConversations.map(async (c)=>{
            let ou;
            let cn=await Conversations.findById(c.id);
            if(cn.members[0]===currUser.id)
            {
                ou=await User.findById(cn.members[1]);
            }
            else
            {
                ou=await User.findById(cn.members[0]);
            }
            return ou;
        }));
        res.status(400).json({success:true,friends:ac,allConversations});
        return ;
    }catch(err)
    {
        res.status(400).json({success:false,message:err.toString()});
        return ;
    }
}

const getMessages=async (req,res)=>{
    try{
        const cid=req.params.conv_id;
        const Allmessages= await Messages.find({conversationId:cid});
        res.status(400).json({success:true,messages:Allmessages});
        return ;
    }catch(err)
    {
        res.status(400).json({success:false,message:err.toString()});
        return ;
    }
}

const sendMessage=async (req,res)=>{
    try{
        const currUser=await User.findOne({email:req.user.email});
        const message=new Messages({
            conversationId:req.body.conversationId.toString(),
            text:req.body.text,
            senderId:currUser.id.toString(),
            date:req.body.date,
            time:req.body.time
        })
        await message.save();
        res.status(200).json({success:true,message});
        return ;
    }catch(err)
    {
        res.status(400).json({success:false,message:err.toString()});
    }
}



export {getConversation,getMessages,getAllConversations,sendMessage};


