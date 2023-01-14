import mongoose, { mongo } from "mongoose";

const groupSchema = new mongoose.Schema({
    name:{type:String, required:true},
    joiningCode:{type:String, required:true},
    owner:{type:mongoose.Schema.Types.ObjectId},
    admins:[{type:mongoose.Schema.Types.ObjectId, default:[]}],
    members:[{type:mongoose.Schema.Types.ObjectId, default:[]}],
    isPublic:{type:Boolean, default:false},
    itemsPosted:[{type:mongoose.Schema.Types.ObjectId, default:[]}],
    assignmentsPosted:[{type:mongoose.Schema.Types.ObjectId, default:[]}],
    logo:{type:String, default:''},
})

const groupModel = mongoose.model("Group",groupSchema);

export {groupModel};