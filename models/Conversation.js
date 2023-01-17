import mongoose from "mongoose";

const conversationSchema=new mongoose.Schema({
    member:{
        type:array,
        default:[]
    }
},{timestamps:true})

const Conversations=mongoose.model('Conversations',conversationSchema);

module.exports=Conversations;