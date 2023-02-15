import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    conversationId:{
        type:String,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    senderId:{
        type:String,
        required:true
    }
},{timestamps:true})

const Messages=mongoose.model("Messages",messageSchema);

export {Messages};