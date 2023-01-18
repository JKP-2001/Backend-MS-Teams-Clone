import { User } from "../models/User.js";

import { groupModel } from "../Models/Group.js";

import { groupAssignmentModel, groupPostModel, scheduleMeetModel } from "../Models/GrpItems.js";

import mongoose from "mongoose";






const postNewItem = async (req, res) => {
    try {
        const groupDetails = req.body.groupDetails;
        const userDetails = req.body.userDetails;
        const type = req.body.type;
        console.log(req.files);

        var files = [];
        for (let i = 0; i < req.files.length; i++) {
            files.push("/" + req.files[i].path);
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

        else if (type == "meet") {
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
            const updatedGrp = await groupModel.findByIdAndUpdate(groupDetails._id,{meetingPosted});
            res.status(200).json({ newMeet });
            return;
        }

        // else if(type=="assignment"){

        // }
    } catch (err) {
        res.status(400).json({ error: err.toString() })
    }
}

export { postNewItem };