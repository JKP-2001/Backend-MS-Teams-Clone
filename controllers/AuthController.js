import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import handlebars from "handlebars";

import { User } from "../models/User.js";
import { getDate, sendEmail, generateAndSendOTP, sendVerifyEmail, sendResetPasswordEmail } from "../functions.js";

const saltRound = 10;
const JWT_SECRET = process.env.JWT_SECRET;


const createUser = async (req, res) => {
    try {
        
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            throw new Error("Email already taken.");
        }

        const payLoad = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        };

        const token = jwt.sign({ user: payLoad }, JWT_SECRET, { expiresIn: '1h' });
        
        const subject = "Confirm your account on Teams"
        const link = `http://localhost:3000/create-password/${token}`
        console.log("token  ",token,"  token");

        sendVerifyEmail(payLoad.email,subject, payLoad.firstName + " " + payLoad.lastName,link)
        res.status(200).send({ "success": true, details: "Sent" });
        return;

    } catch (err) {
        res.status(400).json({ success: false, details: err.toString() });
    }
}

const acceptAccount = async (req, res) => {
    try {
        const token = req.params.token;
        if (!token) {
            throw new Error("Not A Valid Url");
        }
        const decode = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ email: decode.user.email });
        if (!user) {
            const hashPassword = await bcrypt.hash(req.body.password, saltRound);
            const currDateTime = getDate();
            const newUser = await User.create({
                firstName: decode.user.firstName,
                lastName: decode.user.lastName,
                email: decode.user.email,
                password: hashPassword,
                role: ['Student'],
                creationDateAndTime: currDateTime
            })
            res.status(200).json({ success: true, newUser });
            return;
        }
        throw new Error("Link already used.");
    } catch (err) {
        res.status(400).json({ success: false, detail: err.toString() })
    }
}

const loginUser = async (req, res) => {
    try {
        const body = req.body;
        const user = await User.findOne({ email: body.email });
        if (!user) {
            throw new Error("User not found");
        }

        const isUser = await bcrypt.compare(body.password, user.password);

        if (isUser) {
            let otp = generateAndSendOTP(user.email, user.firstName + " " + user.lastName);
            const payLoad = {
                email: user.email,
                role: user.role,
                otp: otp
            }
            const token = jwt.sign({ user: payLoad }, JWT_SECRET);
            const sendingOtp = await User.findByIdAndUpdate(user._id, { lastotp: otp });

            res.status(200).json({ success: true, token: token });
            return;
        }

        throw new Error("Incorrect Password");

    } catch (err) {
        res.status(400).json({ success: false, detail: err.toString() })
    }
}


const checkOTP = async (req, res) => {
    try {
        const user_otp = req.body.otp;
        const user = req.user;
        const findUser = await User.findOne({ email: user.email });
        if (!findUser) {
            throw new Error("User Not Found");
        }

        if (findUser.lastotp !== user_otp) {
            throw new Error("Invalid OTP");
        }

        const payLoad = {
            email: findUser.email,
            role: findUser.role
        }
        const token = jwt.sign({ user: payLoad }, JWT_SECRET, { expiresIn: '10h' });
        const currDateTime = getDate();
        findUser.loginDates.push(currDateTime);
        const updatedUser = await User.findByIdAndUpdate(findUser._id, { loginDates: findUser.loginDates, lastotp: "" });

        res.status(200).json({ success: true, token: token });
        return;

    } catch (err) {
        res.status(400).json({ success: false, detail: err.toString() })
    }
}

const sentResetPasswordMail = async (req, res) => {
    try {
        const email = req.body.email;
        const isUser = await User.findOne({ email: email });
        if (!isUser) {
            throw new Error("User Not Found.")
        }

        const security = await bcrypt.hash("thisisforpasswordcheck", 10);
        const payLoad = {
            id: isUser._id,
            check: security
        };

        const token = jwt.sign({ user: payLoad }, JWT_SECRET, { expiresIn: '900s' });

        const subject = "Reset Password Request"

        const link = `http://localhost:3000/set-new-password/${token}`;

        sendResetPasswordEmail(isUser.email, subject, isUser.firstName + " " + isUser.lastName, isUser.email, link)

        res.status(200).send({ "success": true, "email": "Sent" });
        return;


    } catch (err) {
        res.status(400).json({ success: false, detail: err.toString() })
    }
}


const resetPassword = async (req, res) => {
    try {
        const id = req.params.id;
        const decode = jwt.verify(id, JWT_SECRET);
        console.log(decode);
        const _id = decode.user.id;

        const user = await User.findOne({ _id: _id });
        if (!user) {
            throw new Error("User not found");
        }

        if (user.checkReset === decode.user.check) {
            throw new Error("Link Already Used.");
        }

        const newHashPassword = await bcrypt.hash(req.body.password, 10);

        const updatePass = await User.findByIdAndUpdate(_id, { password: newHashPassword, checkReset: decode.user.check });

        res.status(200).json({ "success": true, details: updatePass });
        return;

    } catch (err) {
        res.status(400).json({ success: false, detail: err.toString() })
    }
}


const getUser=async ( req,res)=>{
    try{
        const user=await User.findOne({email:req.user.email});
        res.status(200).json({success:true,user:{firstName:user.firstName,lastName:user.lastName,email:user.email,id:user.id}});
    }catch(error)
    {
        res.status(400).json({ success: false, detail: err.toString() });        
    }
}




export { createUser, acceptAccount, loginUser, sentResetPasswordMail, resetPassword, checkOTP,getUser };




