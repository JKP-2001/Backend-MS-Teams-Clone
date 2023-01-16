import mongoose from "mongoose";

const grpItemSchema = new mongoose.Schema({
    grpId:{type:mongoose.Schema.Types.ObjectId,required:true},
    itemType:{tyep:String, required:true},
    postedBy:{type:mongoose.Schema.Types.ObjectId, required:true},
    dateTime:{type:Date, required:true},
    
})


const grpItem = mongoose.model("GrpItem",grpItemSchema);