import { fetchUser } from "../middlewares/fetchUser.js";
import express from "express";
import { groupModel } from "../Models/Group.js";
import { User } from "../models/User.js";
import {Assignment} from '../models/Assignment.js'
const getUser = async (email)=>{
    return await User.findOne({email})
  }
const createAssignment=async (req, res) => {
    try {
      const grpId = req.params.id;
      const grp = await groupModel.findById(grpId);
      if(!grp){
        throw new Error("Grp not exist")
      }
      const user = await getUser(req.user.email)
      if (String(grp.owner) !== String(user._id)) {
        throw new Error("You are not the Owner of the Team")
      }
      const assignment = await Assignment.create({
        title: req.body.title,
        grpId: grpId,
        instructions: req.body.instructions,
        dueDateTime:req.body.dueDateTime,
        closedDateTime:req.body.closedDateTime,
        createdAt: new Date(),
      });
      let assignmentsPosted = grp.assignmentsPosted;
      assignmentsPosted.push(assignment._id);
      const updatedGrp = await groupModel.findByIdAndUpdate(grpId, {
        assignmentsPosted
      });
      res.status(200).json(assignment);
    } catch (err) {
      res.status(400).json({success:false, error:err.toString()});
    }
  }

  const getAssignment = async (req, res) => {
    try {
      const assignmentId = req.params.id;
      const assignment = await Assignment.findById(assignmentId);
      if(!assignment){
        throw new Error("Assignment not found");
      }
      const grp = await groupModel.findById(req.body.grpId);
      if(!grp){
        throw new Error("Grp Not Found");
      }

      // Group members array
      const user= await getUser(req.user.email)
      if(!user)throw new Error("Not Authenticated")
      if (!grp.members.includes(user._id)) {
        throw new Error("You are not a member of this Grp");
      }
      res.status(200).json(assignment);
    } catch (err) {
      res.status(400).json({success:"false",error:err.toString()});
    }
  }

  const uppdateAssignment = async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id);
      const grp = await groupModel.findById(assignment.grpId);
      if (grp.owner !== req.user.id) {
        return res.status(401).json("You are not allowed to do that");
      }
      const updatedAssignment = Cart.findByIdAndUpdate(
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
  }

  const getAllAssignment = async (req, res) => {
    try {
      const grp = await groupModel.findById(req.params.id);
      if (!grp.members.includes(req.user.id)) {
        return res.status(401).json("You are not a member of this Grp");
      }
      res.status(200).json(grp.assignmentsPosted)
    } catch (err) {
      res.status(400).json(err);
    }
  }

  const deleteAssignment = async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id);
      if(!assignment)throw new Error("Assignment not found")
      const grp = await groupModel.findById(assignment.grpId);
      if(!grp)throw new Error("Group not found")
      const user=await getUser(req.user.email)
      if (user._id !== grp.owner && !grp.admins.includes(user._id)) {
        throw new Error("You are not allowed to do that");
      }
      const newAssignmentsPosted = grp.assignmentsPosted.map((ids) => {
        return ids != req.params.id;
      });
      const newGrp = await groupModel.findByIdandUpdate(assignment.grpId, {
        assignmentsPosted: newAssignmentsPosted,
      });
      await Assignment.findByIdandDelete(req.params.id);
      res.status(200).json(assignment);
    } catch (err) {
      res.status(400).json(err);
    }
  }

  const turnInAssignment = async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id);
      const grp = await groupModel.findById(assignment.grpId);
      if (!grp.includes(req.user.id)) {
        res.status(401).json("You are not a member of this grp");
      }
      const updatedAssignment = await Assignment.findOneAndUpdate(req.params.id, {
        isTurnIn: true,
      });
      res.status(200).json(updatedAssignment);
    } catch (err) {
      res.status(400).json(err);
    }
  }
  export {createAssignment, getAssignment, uppdateAssignment, deleteAssignment,turnInAssignment}