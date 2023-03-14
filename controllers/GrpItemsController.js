import { User } from "../models/User.js";

import { groupModel } from "../Models/Group.js";

import { groupAssignmentModel, groupPostModel, replyModel, scheduleMeetModel } from "../Models/GrpItems.js";

import mongoose from "mongoose";


const postNewItem = async (req, res) => {
    try {
        const groupDetails = req.body.groupDetails;
        const userDetails = req.body.userDetails;
        const type = req.body.type;

        var files = [];
        console.log(req.files)
        for (let i = 0; i < req.files.length; i++) {
            const newPath = req.files[i].path.replace(/\\/g, '/');
            console.log(req.files[i])
            const entry = {
                files:newPath,
                name:req.files[i].originalname,
                type:req.files[i].mimetype
            }
            files.push(entry);
        }

        if (type === "post") {
            const data = ({
                content: req.body.content,
                files: files,
                details: {
                    grpId: groupDetails._id,
                    postedBy: userDetails._id,
                    timeDate: Date.now()
                }
            })
            const newPost = await groupPostModel.create(data);
            var itemsPosted = groupDetails.itemsPosted;
            itemsPosted.push(newPost._id);
            const updatedGrp = await groupModel.findByIdAndUpdate(groupDetails._id,{itemsPosted});
            res.status(200).json({ newPost });
            return;
        }

        else if (type === "meet") {
            const body = ({
                meetTitle:req.body.title,
                meetDateTime: req.body.starting_date,
                endDateTime: req.body.ending_date,
                details: {
                    grpId: groupDetails._id,
                    postedBy: userDetails._id,
                    timeDate: Date.now()
                }
            })
            const newMeet = await scheduleMeetModel.create(body);
            var meetingPosted = groupDetails.meetingPosted;
            meetingPosted.push(newMeet._id);
            var itemsPosted = groupDetails.itemsPosted;
            itemsPosted.push(newMeet._id);
            // const updatedGrp = await groupModel.findByIdAndUpdate(groupDetails._id,{itemsPosted});
            // res.status(200).json({ newPost });
            const updatedGrp = await groupModel.findByIdAndUpdate(groupDetails._id,{meetingPosted,itemsPosted});
            res.status(200).json({ newMeet });
            return;
        }

        // else if(type=="assignment"){

        // }
    } catch (err) {
        res.status(400).json({ error: err.toString() })
    }
}





const deleteAItem = async (req, res) => {
    try {
        const groupDetails = req.body.groupDetails;
        const userDetails = req.body.userDetails;
        const type = req.body.type;
        const postId = req.body.postId;
        

        if (type === "post") {
            
            const item = await groupPostModel.findById(postId);
            if(!item){
                throw new Error("Item Not Found");
            }
            var itemsPosted = groupDetails.itemsPosted;
            if(!itemsPosted.includes(item._id)){
                throw new Error("This item doesn't belong to this grp.");
            }
            
            if(String(item.details.postedBy)!==String(userDetails._id) && !groupDetails.admins.includes(userDetails._id)){
                throw new Error("Not authorized to delete this item.");
            }
            itemsPosted.splice(itemsPosted.indexOf(item._id),1);
            const updatedGrp = await groupModel.findByIdAndUpdate(groupDetails._id,{itemsPosted});
            const updatePost = await groupPostModel.findByIdAndDelete(item._id);
            res.status(200).json({ success:true, details:"Item deleted." });
            return;
        }

        else if (type === "meet") {
            const body = ({
                meetTitle:req.body.title,
                meetDateTime: req.body.starting_date,
                endDateTime: req.body.ending_date,
                details: {
                    grpId: groupDetails._id,
                    postedBy: userDetails._id,
                    timeDate: Date.now()
                }
            })
            const newMeet = await scheduleMeetModel.create(body);
            var meetingPosted = groupDetails.meetingPosted;
            meetingPosted.push(newMeet._id);
            var itemsPosted = groupDetails.itemsPosted;
            itemsPosted.push(newMeet._id);
            // const updatedGrp = await groupModel.findByIdAndUpdate(groupDetails._id,{itemsPosted});
            // res.status(200).json({ newPost });
            const updatedGrp = await groupModel.findByIdAndUpdate(groupDetails._id,{meetingPosted,itemsPosted});
            res.status(200).json({ newMeet });
            return;
        }

        // else if(type=="assignment"){

        // }
    } catch (err) {
        res.status(400).json({success:false, error: err.toString() })
    }
}



const createReplyToPost = async(req,res)=>{
    try{

        const groupDetails = req.body.groupDetails;
        const userDetails = req.body.userDetails;

        const postId = req.body.postId;
        let post = await groupPostModel.findById(postId);
        if(!post){
            throw new Error("Post Not Found");
        }

        if(String(post.details.grpId)!==String(groupDetails._id)){
            throw new Error("This Item Doesn't Belong to this grp.");
        }

        const replyBody = {
            reply:req.body.text,
            // repliedToPeople:[{type:mongoose.Schema.Types.ObjectId}],
            dateTime:Date.now(),
            replyToGrp:groupDetails._id,
            replyToPost:post._id,
            // replyToMeet:{type:mongoose.Schema.Types.ObjectId},
        }

        const createReply = await replyModel.create(replyBody);
        post.replies.push(createReply._id);
        const updatePost = await groupPostModel.findByIdAndUpdate(post._id,post);
        res.status(200).json({success:true,details:"Reply posted successfully."})

    }catch(err){
        res.status(400).json({ error: err.toString() })
    }
} 


const editPost = async(req,res)=>{
    try{
        const groupDetails = req.body.groupDetails;
        const userDetails = req.body.userDetails;
        const type = req.body.type;
        const postId = req.body.postId;
        

        if (type === "post") {
            const item = await groupPostModel.findById(postId);
            if(!item){
                throw new Error("Item Not Found");
            }
            var itemsPosted = groupDetails.itemsPosted;
            if(!itemsPosted.includes(item._id)){
                throw new Error("This item doesn't belong to this grp.");
            }

            if(String(item.details.postedBy)!==String(userDetails._id)){
                throw new Error("Not authorized to edit this item.");
            }
            
            const updatePost = await groupPostModel.findByIdAndUpdate(item._id,{content:req.body.content});
            res.status(200).json({ success:true, details:"Item updated." });
            return;
        }
    }catch(err){
        res.status(400).json({ error: err.toString() })
    }
}

// const getAllItem

export { postNewItem, createReplyToPost, deleteAItem, editPost };