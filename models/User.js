import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:[String],
        required:true,
        enum:['SuperAdmin','Student','Grp-Admin']
    },
    isBanned:{
        type:Boolean,
        default:false,
    },
    creationDateAndTime:{
        type:Date
    },
    loginDates:{
        type:[Date],
        default:[]
    },
    checkReset:{
        type:String,
        default:""
    },
    lastotp:{
        type:String,
        default:""
    },
    assignmentsAssign:[
        {type:mongoose.Schema.Types.ObjectId, default:[]}
    ],
    filePosted:[
        {type:mongoose.Schema.Types.ObjectId, default:[]}
    ],
    memeberGrps:[
        {type:mongoose.Schema.Types.ObjectId, default:[]}
    ]
});

const User = mongoose.model("user",userSchema);

export {User};