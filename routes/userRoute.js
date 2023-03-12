import express from "express";
const userRouter=express.Router();


import {fetchKeywordUser} from "../controllers/UserController.js"
import { fetchUser } from "../middlewares/fetchUser.js";




userRouter.post("/account/user/fetchKeywordUser",fetchUser,fetchKeywordUser);


export default userRouter;