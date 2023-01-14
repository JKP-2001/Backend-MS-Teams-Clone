import mongoose from "mongoose";
import express from "express";
import { fetchUser } from "../middlewares/fetchUser.js";
import { addAdmins, addUserToGroup, createNewGroup, deleteGroup, getAllGroups, getUserGroups } from "../Controllers/GrpController.js";

const grpRouter = express.Router();

grpRouter.post("/grp/createnewgrp",fetchUser,createNewGroup);
grpRouter.delete("/grp/deletegrp",fetchUser,deleteGroup);
grpRouter.get("/grp/allgroups",getAllGroups);
grpRouter.get("/grp/userallgroups",fetchUser,getUserGroups);
grpRouter.post("/grp/admin/:grpid",fetchUser,addAdmins)
grpRouter.post("/grp/member/:grpid",fetchUser,addUserToGroup)


export {grpRouter}