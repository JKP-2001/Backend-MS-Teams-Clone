import express from "express";
const authRouter = express.Router();

import {acceptAccount, createUser, loginUser, resetPassword, sentResetPasswordMail} from "../Controllers/AuthController.js";

authRouter.post("/account/createuser",createUser);
authRouter.post("/account/accept/:token",acceptAccount);
authRouter.post("/account/login",loginUser);
authRouter.post("/account/reset",sentResetPasswordMail);
authRouter.patch("/account/reset/:id", resetPassword);


export default authRouter;