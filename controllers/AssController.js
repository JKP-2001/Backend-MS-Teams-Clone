import { fetchUser } from "../middlewares/fetchUser.js";
import express from "express";
import { groupModel } from "../Models/Group.js";
import { User } from "../models/User.js";
import { Assignment } from "../models/Assignment.js";
import fs from "fs"
const getUser = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  return user;
};
const getAssignmentFromIds = async (assignmentArray)=>{
  let assignments = []
  var len = assignmentArray.length
  for(var i=0;i<len;i++){
    const ass = await Assignment.findById(assignmentArray[i])
    if(!ass)continue
    assignments.push(ass)
  }
  return assignments
}
const addOrDeleteAssignmentToUser = async (
  assId,
  members,
  admin,
  owner,
  check
) => {
  var n = members.length;

  for (var i = 0; i < n; i++) {
    if (!admin.includes(members[i]) && String(owner) !== String(members[i])) {
      let user = await User.findById(members[i]);
      if (!user) continue;

      let assignmentsAssign = user.assignmentsAssign;
      if (check === "create") {
        assignmentsAssign.push(assId);
      } else {
        assignmentsAssign.splice(assignmentsAssign.indexOf(assId), 1);
      }
      await User.findByIdAndUpdate(user._id, { assignmentsAssign });
    }
  }
};

const createAssignment = async (req, res) => {
  try {
    const grpId = req.params.id;
    const grp = await groupModel.findById(grpId);
    if (!grp) {
      throw new Error("Grp not exist");
    }
    const user = await getUser(req.user.email);
    if (String(grp.owner) !== String(user._id) && !admins.includes(user._id)) {
      throw new Error("You are not the Owner of the Team");
    }
    var files = [];
    console.log(req.files)
    for (let i = 0; i < req.files.length; i++) {
        files.push(req.files[i].path);
    }
    const assignment = await Assignment.create({
      title: req.body.title,
      uploadedBy:user._id,
      grpId: grp._id,
      files:files,
      instructions: req.body.instructions,
      dueDateTime: req.body.dueDateTime,
      closedDateTime: req.body.closedDateTime,
      createdAt: new Date(),
    });
    let assignmentsPosted = grp.assignmentsPosted;
    assignmentsPosted.push(assignment._id);
    await addOrDeleteAssignmentToUser(
      assignment._id,
      grp.members,
      grp.admins,
      grp.owner,
      "create"
    );
    const updatedGrp = await groupModel.findByIdAndUpdate(grpId, {
      assignmentsPosted,
    });
    res.status(200).json(assignment);
  } catch (err) {
    res.status(400).json({ success: false, error: err.toString() });
  }
};

const getAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    const grp = await groupModel.findById(req.body.grpId);
    if (!grp) {
      throw new Error("Grp Not Found");
    }

    // Group members array
    const user = await getUser(req.user.email);
    if (!user) throw new Error("Not Authenticated");
    if (!grp.members.includes(user._id)) {
      throw new Error("You are not a member of this Grp");
    }
    res.status(200).json(assignment);
  } catch (err) {
    res.status(400).json({ success: "false", error: err.toString() });
  }
};
// 
const uppdateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    const grp = await groupModel.findById(req.body.grpId);
    if (!grp) {
      throw new Error("Grp Not Found");
    }
    const user = await getUser(req.user.email);
    if(!user){
      throw new Error("User Not found");
    }
    if (String(user._id) !== String(assignment.uploadedBy))  {
      return res.status(401).json("You are not allowed to do that");
    }
    
    for(var i=0;i<assignment.files.length;i++){
      fs.unlinkSync(assignment.files[i])
    }

    var files = [];
    console.log(req.files)
    for (let i = 0; i < req.files.length; i++) {
        files.push(req.files[i].path);
    }

    const updatedAssignment =await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedAssignment);
  } catch (err) {
    res.status(400).json(err);
  }
};

const getAllAssignment = async (req, res) => {
  try {
    const grp = await groupModel.findById(req.params.id);
    if(!grp)throw new Error("Group not found")
    const user =  await getUser(req.user.email)
    if (!grp.members.includes(user._id)) {
      return res.status(401).json("You are not a member of this Grp");
    }
    const assignmentsPosted = await getAssignmentFromIds(grp.assignmentsPosted)
    res.status(200).json(assignmentsPosted);
  } catch (err) {
    res.status(400).json(err);
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    //   console.log(assignment)
    if (!assignment) throw new Error("Assignment not found");
    const grp = await groupModel.findById(assignment.grpId);
    if (!grp) throw new Error("Group not found");
    const user = await getUser(req.user.email);
    if (
      String(user._id) !== String(assignment.uploadedBy)) {
      throw new Error("You are not allowed to do that");
    }
    let assignmentsPosted = grp.assignmentsPosted;
    //     return String(ids)!=String(assignment._id)
    //   });
    //   console.log({assId:assignmentsPosted.indexOf(assignment._id)})
    assignmentsPosted.splice(assignmentsPosted.indexOf(assignment._id), 1);
    //   console.log(assignmentsPosted)
    const newGrp = await groupModel.findByIdAndUpdate(assignment.grpId, {
      assignmentsPosted,
    });
    await addOrDeleteAssignmentToUser(
      assignment._id,
      grp.members,
      grp.admins,
      grp.owner,
      "delete"
    );
    for(var i=0;i<assignment.files.length;i++){
      fs.unlinkSync(assignment.files[i])
    }
    await Assignment.findByIdAndDelete(assignment._id);
    res.status(200).json(assignment);
  } catch (err) {
    res.status(400).json({ success: false, err: err.toString() });
  }
};
// <---! Have to be completed --->
const turnInAssignment = async (req, res) => {
  try {
    const user = await getUser(req.user.email);
    const assignment = await Assignment.findById(req.params.id);
    //   console.log(assignment)
    if (!assignment) throw new Error("Assignment not found");

    const grp = await groupModel.findById(assignment.grpId);
    if (!grp.members.includes(user._id)) {
      res.status(401).json("You are not a member of this grp");
    }
    let submission = {
      userId: user._id,
      material: [],
      dateTime: Date.now(),
    };
    let turnedInBy = assignment.turnedInBy;
    if (turnedInBy.includes(user._id)) {
      turnedInBy.splice(turnedInBy.indexOf(user._id), 1);
      submission = {};
    } else {
      turnedInBy.push(user._id);
    }
    const updatedAssignment = await Assignment.findOneAndUpdate(req.params.id, {
      submission,
      turnedInBy,
    });
    res.status(200).json(updatedAssignment);
  } catch (err) {
    res.status(400).json(err);
  }
};

const submitAssignment = async (req,res)=>{
  try{
    const user = await getUser(req.user.email);
    const assignment = await Assignment.findById(req.params.id);
    //   console.log(assignment)
    if (!assignment) throw new Error("Assignment not found");
    let assignmentSubmitted,assignmentsAssign,turnedInBy

    if(user.assignmentSubmitted.includes(assignment._id)){
      assignmentSubmitted=user.assignmentSubmitted.splice(indexOf(assignment._id),1)
      assignmentsAssign=user.assignmentsAssign.push(assignment._id)
      turnedInBy=assignment.turnedInBy.splice(indexOf(assignment._id),1)
    }else{
      assignmentSubmitted = user.assignmentSubmitted.push(assignment._id);
      assignmentsAssign=user.assignmentsAssign.splice(indexOf(assignment._id),1)
      turnedInBy=assignment.turnedInBy.push(assignment._id)
    }
    
    const updatedUser = user.findByIdAndUpdate(user._id,{assignmentSubmitted,assignmentsAssign})
    const updatedAssignment = Assignment.findByIdAndUpdate(assignment._id,{turnedInBy})
    res.status(200).json({updatedUser,updatedAssignment})
  }catch(err){
    res.status(400).json({success:false,error:err})
  }
}
export {
  createAssignment,
  getAssignment,
  uppdateAssignment,
  deleteAssignment,
  turnInAssignment,
  getAllAssignment,
  submitAssignment
};
