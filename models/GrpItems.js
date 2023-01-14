import mongoose from "mongoose";

const grpItemSchema = new mongoose.Schema({
    grpId:{type:mongoose.Schema.Types.ObjectId,required:true},
    grpName:{type:String, required:true}
})


const grpItem = mongoose.model("GrpItem",grpItemSchema);