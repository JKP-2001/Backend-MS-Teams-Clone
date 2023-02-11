import { fetchUser } from "../middlewares/fetchUser.js";
import express from "express";
import { groupModel } from "../Models/Group.js";
import { User } from "../models/User.js";
import {Assignment} from '../models/Assignment.js'
import { createAssignment, deleteAssignment, getAssignment, turnInAssignment, uppdateAssignment } from "../controllers/AssController.js";
const assRouter = express.Router();



// Create Assignment

assRouter.post("/assignment/:id", fetchUser, createAssignment);

// Get Assinment By Id
assRouter.get("/assignment/:id", fetchUser, getAssignment);

// Get All Assignments ---> some changes are required
assRouter.get("/allAssignment/:id", fetchUser, );

// Update Assignment
assRouter.put("/assignment/:id", fetchUser,uppdateAssignment );

// Delete Assignment
assRouter.delete("/assignment/:id", fetchUser,deleteAssignment );

// Turn in Assignment
assRouter.post("/assignment/turnin/:id", fetchUser,turnInAssignment);


export {assRouter}
