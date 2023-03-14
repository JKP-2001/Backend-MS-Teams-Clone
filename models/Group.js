import mongoose, { mongo } from "mongoose";

const groupSchema = new mongoose.Schema({
    name:{type:String, required:true},
    description:{type:String,},
    joiningCode:{type:String, required:true},
    owner:{type:mongoose.Schema.Types.ObjectId},
    admins:[{type:mongoose.Schema.Types.ObjectId, default:[]}],
    members:[{type:mongoose.Schema.Types.ObjectId, default:[]}],
    isPublic:{type:Boolean, default:false},
    itemsPosted:[{type:mongoose.Schema.Types.ObjectId, default:[]}],
    meetingPosted:[{type:mongoose.Schema.Types.ObjectId, default:[]}],
    assignmentsPosted:[{type:mongoose.Schema.Types.ObjectId, default:[]}],
    logo:{type:String, default:''},
    createdDateAndTime:{type:Date,required:true}
})

const groupModel = mongoose.model("Group",groupSchema);

export {groupModel};