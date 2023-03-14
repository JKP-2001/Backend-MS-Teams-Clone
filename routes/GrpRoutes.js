import mongoose from "mongoose";
import express from "express";
import { fetchUser } from "../middlewares/fetchUser.js";
import { addAdmins, addUserToGroup, createNewGroup, deleteGroup, getAllGroups, getAllItemsOfAGrp, getAllMembers, getDetailsOfAGroup, getJoiningCode, getUserGroups, joinGrpByCode, resetJoiningCode, setGrpType, transferOwnerShip } from "../Controllers/GrpController.js";

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
grpRouter.post("/group/getDetails",fetchUser,getDetailsOfAGroup);
grpRouter.patch("/group/transferownership",fetchUser,transferOwnerShip);
grpRouter.patch("/group/joinbycode",fetchUser,joinGrpByCode);
grpRouter.post("/group/allmembers",fetchUser,getAllMembers);
grpRouter.post("/group/allitems",fetchUser,getAllItemsOfAGrp);


export {grpRouter}