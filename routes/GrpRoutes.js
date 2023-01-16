import mongoose from "mongoose";
import express from "express";
import { fetchUser } from "../middlewares/fetchUser.js";
import { addAdmins, addUserToGroup, createNewGroup, deleteGroup, getAllGroups, getDetailsOfAGroup, getJoiningCode, getUserGroups, resetJoiningCode, setGrpType, transferOwnerShip } from "../Controllers/GrpController.js";

const grpRouter = express.Router();

grpRouter.post("/group/createnewgrp",fetchUser,createNewGroup);
grpRouter.delete("/group/deletegrp",fetchUser,deleteGroup);
grpRouter.get("/group/allgroups",getAllGroups);
grpRouter.get("/group/userallgroups",fetchUser,getUserGroups);
grpRouter.patch("/group/admin/:grpid",fetchUser,addAdmins)
grpRouter.patch("/group/member/:grpid",fetchUser,addUserToGroup)
grpRouter.get("/group/getcode", fetchUser, getJoiningCode);
grpRouter.patch("/group/resetcode",fetchUser,resetJoiningCode)
grpRouter.patch("/group/setgrptype",fetchUser,setGrpType);
grpRouter.get("/group/getDetails",fetchUser,getDetailsOfAGroup);
grpRouter.patch("/group/transferownership",fetchUser,transferOwnerShip);


export {grpRouter}