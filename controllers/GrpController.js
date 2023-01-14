import express from "express"
import mongoose from "mongoose"
import { generateGrpCode } from "../functions.js";
import { groupModel } from "../Models/Group.js"
import { User } from "../models/User.js";


const getAllGroupsFromArray = async (grpArray) => {
    let array = [];
    for (let i = 0; i < grpArray.length; i++) {
        const grp = await groupModel.findById(grpArray[i]);
        if (grp) {
            array.push(grp);
        }
    }
    return array;
}



const getAllGroups = async (req, res) => {
    try {
        const query = req.query.type;
        console.log({ query });
        let allGroups = [];
        if (query === "public") {
            allGroups = await groupModel.find({ isPublic: true });
        }
        else if (query === "private") {
            allGroups = await groupModel.find({ isPublic: false });
        }
        else if (query === "all") {
            allGroups = await groupModel.find({});
            console.log({ allGroups })
        }
        else {
            throw new Error("type required in query")
        }
        res.status(200).json({ success: true, details: allGroups });
        return;
    } catch (err) {
        res.status(400).json({ success: false, error: err.toString() });
    }
}

const getUserGroups = async (req, res) => {
    try {
        const loggeduser = req.user;
        const user = await User.findOne({ email: loggeduser.email });
        if (!user) {
            throw new Error("User Not Found");
        }
        const userGrpArray = user.memeberGrps;
        const result = await getAllGroupsFromArray(userGrpArray);
        res.status(200).json({ success: true, details: result });
        return;

    } catch (err) {
        res.status(400).json({ success: false, error: err.troString() })
    }
}

const addAdmins = async (req, res) => {
    try {
        const grpid = req.params.grpid;
        const grp = await groupModel.findById(grpid);
        const query = req.query.action;
        if (!grp) {
            throw new Error("Group not found.");
        }
        const loggeduser = req.user;
        const user = await User.findOne({ email: loggeduser.email });
        if (!user) {
            throw new Error("User Not Found");
        }

        if (query === "add") {
            if (String(grp.owner) === String(user._id) || grp.admins.includes(user._id)) {
                const reqUser = req.body.email;
                const isUser = await User.findOne({ email: reqUser });
                if (!isUser) {
                    throw new Error("Requested user doens't exist.")
                }
                if (!isUser.memeberGrps.includes(grp._id) && !grp.members.includes(isUser._id) && !isUser) {
                    throw new Error("Requested user not existed in the group.")
                }
                let admins = grp.admins;
                if(admins.includes(isUser._id)){
                    throw new Error("User Already An Admin.")
                }
                admins.push(isUser._id);
                const updatedGrp = await groupModel.findByIdAndUpdate(grpid, { admins: admins });
                if (updatedGrp) {
                    res.status(200).json({ success: true, details: `${req.body.email} Added Successfully` });
                    return;
                }
            }
            throw new Error("Only admins can add other as admin.")
        }

        else if (query === "delete") {
            if (String(grp.owner) === String(user._id) || grp.admins.includes(user._id)) {
                const reqUser = req.body.email;
                const isUser = await User.findOne({ email: reqUser });
                if (!isUser.memeberGrps.includes(reqUser) || !grp.members.includes(isUser._id) || !isUser) {
                    throw new Error("Requested user not existed in the group.")
                }
                if (!grp.admins.includes(isUser._id)) {
                    throw new Error("Requested email is not an admin.")
                }
                let admins = grp.admins;
                if(!admins.includes(isUser._id)){
                    throw new Error("Requested User is not an Admin.")
                }
                for (var i = 0; i < admins.length; i++) {
                    if (String(isUser._id) === String(admins[i])) {
                        admins.splice(i, 1);
                        break;
                    }
                }
                const updatedGrp = await groupModel.findByIdAndUpdate(grpid, { admins: admins });
                if (updatedGrp) {
                    res.status(200).json({ success: true, details: `${req.body.email} deleted Successfully` });
                    return;
                }
            }
            throw new Error("Only admins can add delete other admin.")
        }
        // else if(query === "undefined"){}

    } catch (err) {
        res.status(400).json({ success: false, error: err.toString() })
    }
}

const addUserToGroup = async (req, res) => {
    try {

        const grpid = req.params.grpid;
        const grp = await groupModel.findById(grpid);
        const query = req.query.action;
        if (!grp) {
            throw new Error("Group not found.");
        }
        const loggeduser = req.user;
        const user = await User.findOne({ email: loggeduser.email });
        if (!user) {
            throw new Error("User Not Found");
        }

        if (query === "add") {
            if (String(grp.owner) === String(user._id) || grp.admins.includes(user._id)) {
                const reqUser = req.body.email;
                const isUser = await User.findOne({ email: reqUser });
                if (!isUser) {
                    throw new Error("Requested user doens't exist.")
                }

                let members = grp.members;
                if(members.includes(isUser._id)){
                    throw new Error("User Already Exisited In the Group.")
                }
                members.push(isUser._id);
                const updatedGrp = await groupModel.findByIdAndUpdate(grpid, { members: members });
                if (updatedGrp) {
                    res.status(200).json({ success: true, details: `${req.body.email} Added Successfully` });
                    return;
                }
            }
            throw new Error("Only admins can add other as admin.")
        }

        else if (query === "delete") {
            if (String(grp.owner) === String(user._id) || grp.admins.includes(user._id)) {
                const reqUser = req.body.email;
                const isUser = await User.findOne({ email: reqUser });

                if (!isUser) {
                    throw new Error("Requested user doens't exist.")
                }
                let members = grp.members;

                if(members.length === 0){
                    throw new Error("User Not Exisited In the Group.")
                }
                if(!members.includes(isUser._id)){
                    throw new Error("User Not Exisited In the Group.")
                }
                for(let i = 0;i<members.length;i++){

                    if (String(isUser._id) === String(members[i])) {
                        members.splice(i, 1);
                        break;
                    }
                }
                let admins = grp.admins;

                if(admins.includes(isUser._id)){
                    for(let i = 0;i<admins.length;i++){

                        if (String(isUser._id) === String(admins[i])) {
                            admins.splice(i, 1);
                            break;
                        }
                    }
                }

                const updatedGrp = await groupModel.findByIdAndUpdate(grpid, { members: members, admins:admins });
                if (updatedGrp) {
                    res.status(200).json({ success: true, details: `${req.body.email} deleted Successfully` });
                    return;
                }
            }
            throw new Error("Only admins can add delete other admin.")
        }
        // else if(query === "undefined"){}

    } catch (err) {
        res.status(400).json({ success: false, error: err.toString() })
    }
}


const createNewGroup = async (req, res) => {
    try {
        const loggeduser = req.user;
        const user = await User.findOne({ email: loggeduser.email });
        if (!user) {
            throw new Error("User Not Found");
        }

        const body = req.body;
        const grpCode = generateGrpCode();

        const data = {
            name: "Grp_" + body.name,
            joiningCode: grpCode,
            owner: user._id,
        }

        const create = await groupModel.create(data);
        if (create) {
            let memeberGrps = user.memeberGrps;
            memeberGrps.push(create._id);
            const updateUser = await User.findByIdAndUpdate(user._id, { memeberGrps: memeberGrps })
            res.status(200).json({ success: true, details: create });
            return;
        }

    } catch (err) {
        res.status(400).json({ success: false, error: err.toString() });
    }
}

const deleteGroup = async (req, res) => {
    try {
        const grpId = req.query.grpid;
        const group = await groupModel.findById(grpId);
        if (!group) {
            throw new Error("Group Not Found");
        }

        const loggedUser = req.user;
        const user = await User.findOne({ email: loggedUser.email });
        if (!user) {
            throw new Error("User Not Found");
        }

        if (String(user._id) !== String(group.owner)) {
            throw new Error("You are not the owner of this group");
        }

        const deleteGroup = await groupModel.findByIdAndDelete(group._id);
        if (deleteGroup) {
            let memeberGrps = user.memeberGrps;
            for (let i = 0; i < memeberGrps.length; i++) {
                if (String(memeberGrps[i]) === String(group._id)) {
                    memeberGrps.splice(i, 1);
                    break;
                }
            }
            const updateUser = await User.findByIdAndUpdate(user._id, { memeberGrps: memeberGrps })
            res.status(200).json({ success: true, details: updateUser });
            return;
        }

    } catch (err) {
        res.status(400).json({ "success": false, error: err.toString() });
    }
}

// const getAllAssignmentsForAGroup = async (req,res)=>{
//     try{

//         const loggeduser = req.user;
//         const user = await User.findOne({ email: loggeduser.email });
//         if (!user) {
//             throw new Error("User Not Found");
//         }

//         const query = req.query.type;
//         let allGroups = [];
//         if(query === "public"){
//             allGroups = await groupModel.find({isPublic:true});
//         }
//         else if(query===null){
//             allGroups = await groupModel.find({});
//         }
//         res.status(200).json({success:true, details:allGroups});
//         return;
//     }catch(err){
//         res.status(400).json({success:false, error:err.toString()});
//     }
// }


export { createNewGroup, deleteGroup, getAllGroups, getUserGroups, addAdmins, addUserToGroup };