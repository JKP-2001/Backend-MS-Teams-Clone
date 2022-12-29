import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
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
    }
});

const User = mongoose.model("user",userSchema);

export {User};