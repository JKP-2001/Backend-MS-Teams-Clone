import mongoose from "mongoose";

const conversationSchema=new mongoose.Schema({
    members:{
        type:Array,
        default:[]
    }
},{timestamps:true})

const Conversations=mongoose.model('Conversations',conversationSchema);

export {Conversations};