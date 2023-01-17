import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
},{timestamps:true})

const Messages=mongoose.model("Messages",messageSchema);

module.exports=Messages;