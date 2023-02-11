import mongoose from "mongoose";


const repliesSchema = new mongoose.Schema({
    reply:{type:String, required:true},
    repliedToPeople:[{type:mongoose.Schema.Types.ObjectId}],
    dateTime:{type:Date, default:Date.now()},
    replyToGrp:{type:mongoose.Schema.Types.ObjectId},
    replyToPost:{type:mongoose.Schema.Types.ObjectId},
    replyToMeet:{type:mongoose.Schema.Types.ObjectId},
})


const groupPostSchema = new mongoose.Schema({
    content:{type:String,required:true},
    files:[{type:String,required:true}],
    replies:[{type:mongoose.Schema.Types.ObjectId, default:[]}],
    reactions:[{type:mongoose.Schema.Types.ObjectId,default:[]}],
    details:{
        grpId:{type:mongoose.Schema.Types.ObjectId,required:true},
        postedBy:{type:mongoose.Schema.Types.ObjectId,required:true},
        timeDate:{type:Date,default:Date.now()}
    }      
})

const scheduleMeetSchema = new mongoose.Schema({
    meetTitle:{type:String, required:true},
    meetDateTime:{type:Date, default:Date.now()},
    replies:[{type:mongoose.Schema.Types.ObjectId, default:[]}],
    reactions:[{type:mongoose.Schema.Types.ObjectId,default:[]}],
    endDateTime:{type:Date, default:Date.now()},
    details:{
        grpId:{type:mongoose.Schema.Types.ObjectId,required:true},
        postedBy:{type:mongoose.Schema.Types.ObjectId,required:true},
        timeDate:{type:Date,default:Date.now()}
    } 
})

const groupAssignmentPosted = new mongoose.Schema({
    assignmentId:{type:mongoose.Schema.Types.ObjectId,required:true},
})


// const grpItemModel = mongoose.model("GrpItem");
const groupPostModel = mongoose.model("GrpPost",groupPostSchema);
const scheduleMeetModel = mongoose.model("ScheduleMeeting",scheduleMeetSchema);
const groupAssignmentModel = mongoose.model("groupAssignment",groupAssignmentPosted);
const replyModel = mongoose.model("Replie",repliesSchema);

export {groupPostModel, scheduleMeetModel, groupAssignmentModel, replyModel};