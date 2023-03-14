import express from "express"
import mongoose from "mongoose"
import fs from "fs";
import { generateGrpCode, ReadAppend } from "../functions.js";
import { groupModel } from "../Models/Group.js"
import { User } from "../models/User.js";
import { groupPostModel, scheduleMeetModel } from "../Models/GrpItems.js";

const file = 'APILogs.txt'
const BASE_URL = process.env.BASE_URL

//Function to extract groups
async function getAllGroupsFromArray(grpArray) {
    let array = [];
    for (let i = 0; i < grpArray.length; i++) {
        const grp = await groupModel.findById(grpArray[i])
        if (grp) {
            array.push(grp);
        }
    }
    return array;
}

//Function to extract member
async function getAllMembersFromArray(memberArray) {
    let array = [];
    for (let i = 0; i < memberArray.length; i++) {
        const grp = await User.findById(memberArray[i]).select("firstName lastName email");
        if (grp) {
            array.push(grp);
        }
    }
    return array;
}


async function getItemFromArray(grpItems){
    var array = [];
    for(let i = 0; i< grpItems.length; i++){
        var item = await groupPostModel.findById(grpItems[i]);
        if(item){
            const owner = await User.findById(item.details.postedBy).select('firstName lastName email');
            if(owner){
                
                item = JSON.parse(JSON.stringify(item));
                item.owner = owner
                array.push(item);
                continue;
            }
        }
        item = await scheduleMeetModel.findById(grpItems[i]);
        if(item){
            const owner = await User.findById(item.details.postedBy).select('firstName lastName email');
            if(owner){
                item = JSON.parse(JSON.stringify(item));
                item.owner = owner
                array.push(item);
                continue;
            }
        }
    }
    return array;
}




const getAllGroups = async (req, res) => {
    try {
        const query = req.query.type;
        let allGroups = [];
        if (query === "public") {
            allGroups = await groupModel.find({ isPublic: true });
        }
        else if (query === "private") {
            allGroups = await groupModel.find({ isPublic: false });
        }
        else if (query === "all") {
            allGroups = await groupModel.find({});
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
                if (!grp.members.includes(isUser._id)) {
                    throw new Error("Requested user not existed in the group.")
                }
                let admins = grp.admins;
                if (admins.includes(isUser._id)) {
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
                if (!isUser) {
                    throw new Error("Req user doesn't exist.")
                }
                if (!isUser.memeberGrps.includes(grp._id) || !grp.members.includes(isUser._id)) {
                    throw new Error("Requested user not existed in the group.")
                }
                if (!grp.admins.includes(isUser._id)) {
                    throw new Error("Requested email is not an admin.")
                }
                let admins = grp.admins;
                admins.splice(admins.indexOf(isUser._id), 1);
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
                if (members.includes(isUser._id)) {
                    throw new Error("User Already Exisited In the Group.")
                }
                members.push(isUser._id);
                const updatedGrp = await groupModel.findByIdAndUpdate(grpid, { members: members });
                if (updatedGrp) {
                    let memeberGrps = isUser.memeberGrps;
                    memeberGrps.push(grp._id);
                    const updateUser = await User.findByIdAndUpdate(isUser._id, { memeberGrps })
                    res.status(200).json({ success: true, details: `${req.body.email} Added Successfully` });
                    return;
                }
            }
            throw new Error("Only admins can add other members.")
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

                if(String(grp.owner) === String(isUser._id)){
                    throw new Error("You are the owner, please transfer the ownership first.");
                }

                members.splice(members.indexOf(isUser._id), 1);
                let admins = grp.admins;

                if (admins.includes(isUser._id)) {
                    admins.splice(admins.indexOf(isUser._id), 1);
                }

                const updatedGrp = await groupModel.findByIdAndUpdate(grpid, { members: members, admins: admins });
                if (updatedGrp) {
                    let memeberGrps = isUser.memeberGrps;
                    memeberGrps.splice(memeberGrps.indexOf(grp._id), 1);
                    const user = await User.findByIdAndUpdate(isUser._id, { memeberGrps })
                    res.status(200).json({ success: true, details: `${req.body.email} deleted Successfully` });
                    return;
                }
            }
            throw new Error("Only admins can add or delete other members.")
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
            description: desc,
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

const getJoiningCode = async (req, res) => {
    try {
        const loggeduser = req.user;
        const isUser = await User.findOne({email:loggeduser.email});
        if(!isUser){
            throw new Error("User not found");
        }
        const grpid = req.body.group_id;
        const grp = await groupModel.findById(grpid);
        if (!grp) {
            throw new Error("Group doesn't exist");
        }
        
        if(!grp.admins.includes(isUser._id) && String(grp.owner) !== String(isUser._id)){
            throw new Error("You are not an admin of this group");
        }

        const code = grp.joiningCode;
        res.status(200).json({ success: true, joiningCode: code });
    } catch (err) {
        res.status(400).json({ "success": false, error: err.toString() });
    }
}

const resetJoiningCode = async (req, res) => {
    try {
        const loggedUser = req.user;
        const isUser = await User.findOne({ email: loggedUser.email });
        if (!isUser) {
            throw new Error("User not found");
        }
        const grpid = req.body.group_id;
        const grp = await groupModel.findById(grpid);
        if (!grp) {
            throw new Error("Group doesn't exist");
        }
        
        if(!grp.admins.includes(isUser._id) && String(grp.owner) !== String(isUser._id)){
            throw new Error("You are not an admin of this group");
        }

        const newCode = generateGrpCode();
        const updateGroup = await groupModel.findByIdAndUpdate(grp._id, { joiningCode: newCode });
        res.status(200).json({ success: true, details: "Group code reset." });

    } catch (err) {
        res.status(400).json({ "success": false, error: err.toString() });
    }
}


const setGrpType = async (req, res) => {
    try {
        const loggedUser = req.user;
        const isUser = await User.findOne({ email: loggedUser.email });
        if (!isUser) {
            throw new Error("User not found");
        }
        const grpid = req.body.group_id;
        const grp = await groupModel.findById(grpid);
        if (!grp) {
            throw new Error("Group doesn't exist");
        }
        
        if(String(grp.owner) !== String(isUser._id)){
            throw new Error("You are not the owner of this group");
        }
        const updatedGrp = await groupModel.findByIdAndUpdate(grp._id, { isPublic: !grp.isPublic });
        res.status(200).json({ success: true, isPublic: !grp.isPublic })
    } catch (err) {
        res.status(400).json({ "success": false, error: err.toString() });
    }
}

const getDetailsOfAGroup = async (req, res) => {
    try {
        const loggedUser = req.user;
        const isUser = await User.findOne({ email: loggedUser.email });
        if (!isUser) {
            throw new Error("User not found");
        }
        const grpid = req.body.group_id;
        const grp= await groupModel.findById(grpid);
        
        if(!grp){
            throw new Error("Group doesn't exist");
        }

        if (!grp.admins.includes(isUser._id) && String(grp.owner) !== String(isUser._id) && !grp.members.includes(isUser._id)) {
            throw new Error("You are not a of this group");
        }

        const queries = req.body.queries;
        let details;
        if (!queries || queries.length === 0) {
            details = grp;
        }
        else {
            details = [];
            // console.log("queries[0] = ",(queries[0]))
            for (let i = 0; i < queries.length; i++) {
                let query = {};
                query[queries[i]] = grp[queries[i]];
                details.push(query);
            }
        }
        res.status(200).json({ success: true, details });
    } catch (err) {
        res.status(400).json({ "success": false, error: err.toString() });
    }
}


const transferOwnerShip = async (req, res) => {
    try {
        const loggedUser = req.user;
        const isUser = await User.findOne({ email: loggedUser.email });
        if (!isUser) {
            throw new Error("User not found");
        }
        const grpid = req.body.group_id;
        const grp= await groupModel.findById(grpid);
        
        if(!grp){
            throw new Error("Group doesn't exist");
        }

        if (String(grp.owner) !== String(isUser._id)) {
            throw new Error("You are not the owner of this group");
        }

        const newOwnerEmail = req.body.email;
        const newUser = await User.findOne({email:newOwnerEmail});
        
        if(!newUser){
            throw new Error("Requested user is not exisited.");
        }

        if (String(newUser._id) === String(grp.owner)) {
            throw new Error("You cannot add yourself as owner.");
        }

        let admins = grp.admins;
        if (!admins.includes(newUser._id)) {
            admins.push(newUser._id);
        }

        const updatedGroup = await groupModel.findByIdAndUpdate(grp._id, { owner: newUser._id, admins });
        res.status(200).json({ success: true, details: `ownership transferred to ${newOwnerEmail}` });
        return;
    } catch (err) {
        res.status(400).json({ "success": false, error: err.toString() });
    }
}

// const joinGrpByCode = async (req, res) => {
//     try {
//         const loggedUser = req.user;
//         const user = await User.findOne({ email: loggedUser.email });
//         if (!user) {
//             throw new Error("User not found");
//         }
//         ReadAppend(file, `PATCH: ${BASE_URL}/group/joinbycode called by user ${user.email} at ${Date.now()}\n`);
//         const grpCode = req.body.grp_code;
//         const grp = await groupModel.findOne({ joiningCode: grpCode });
//         if (!grp) {
//             throw new Error("Grp Doesn't Exist Or Code Expired");
//         }

//         if (grp.members.includes(user._id) || grp.admins.includes(user._id) || String(grp.owner) === String(user._id)) {
//             throw new Error("Already a member.")
//         }

//         let members = grp.members;
//         if(!members.includes(newUser._id)){
//             members.push(newUser._id);
//         }

//         const updatedGroup = await groupModel.findByIdAndUpdate(grp._id,{owner:newUser._id, admins, members});
//         res.status(200).json({success:true, details:`ownership transferred to ${newOwnerEmail}`});
//         return;
//     }catch(err){
//         res.status(400).json({ "success": false, error: err.toString() });
//     }
// }

const joinGrpByCode = async(req,res)=>{
    try{
        const loggedUser = req.user;
        const user = await User.findOne({email:loggedUser.email});
        if(!user){
            throw new Error("User not found");
        }
        ReadAppend(file,`PATCH: ${BASE_URL}/group/joinbycode called by user ${user.email} at ${Date.now()}\n`);
        const grpCode = req.body.grp_code;
        const grp = await groupModel.findOne({joiningCode:grpCode});
        if(!grp){
            throw new Error("Grp Doesn't Exist Or Code Expired");
        }

        if(grp.members.includes(user._id) || grp.admins.includes(user._id) || String(grp.owner) === String(user._id)){
            throw new Error("Already a member.")
        }

        let members = grp.members;
        members.push(user._id);
        let memeberGrps = user.memeberGrps;
        memeberGrps.push(grp._id);
        const addedUser = await groupModel.findByIdAndUpdate(grp._id,{members});
        const addedGrp = await User.findByIdAndUpdate(user._id,{memeberGrps});
        res.status(200).json({success:true, details:`${user.email} successfully added to the grp`})
        return;

    }catch(err){
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
//ll


export { createNewGroup, deleteGroup, getAllGroups, getUserGroups, addAdmins, addUserToGroup, getJoiningCode, resetJoiningCode, setGrpType, getDetailsOfAGroup, transferOwnerShip};