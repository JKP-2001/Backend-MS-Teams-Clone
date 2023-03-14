import express from "express";
const authRouter = express.Router();

import {acceptAccount, createUser, loginUser, resetPassword, sentResetPasswordMail, checkOTP, getUserProfile, checkTokenExpiry} from "../Controllers/AuthController.js";
import { fetchUser } from "../middlewares/fetchUser.js";

authRouter.post("/account/createuser",createUser);
authRouter.post("/account/accept/:token",acceptAccount);
authRouter.post("/account/login",loginUser);
authRouter.post("/account/reset",sentResetPasswordMail);
authRouter.patch("/account/reset/:id", resetPassword);
authRouter.post("/account/checkotp", fetchUser, checkOTP);
authRouter.get("/account/getuserdetail", fetchUser, getUserProfile);
authRouter.get("/account/auth/checktoken",checkTokenExpiry)

export default authRouter;