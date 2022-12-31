import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { getDate, sendEmail, generateAndSendOTP } from "../functions.js";

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

        // const text = `Hello ${payLoad.firstName + " " + payLoad.lastName },\n\nThank you for showing interest in https://teams.com. To finish signing up, you just need to confirm your email by clicking the link below.\nThe link is valid for next 1 hour.\n\nhttp://localhost:5000/teams_clone/v1/account/accept/${token}\n\nThanking You\nTeam Org.`



        const text = `Hello ${payLoad.firstName + " " + payLoad.lastName},\n\nThank you for showing interest in https://teams.com. To finish signing up, you just need to confirm your email by clicking the link below.\nThe link is valid for next 1 hour.\n\nhttp://localhost:3000/create-password/${token} \n\nThanking You\nTeam Org.`

        const subject = "Confirm your account on Teams"

        sendEmail(payLoad.email, subject, text);

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
            const token = jwt.sign({ user: payLoad }, JWT_SECRET, { expiresIn: '300s' });
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
        // await User.findByIdAndUpdate(user._id,{loginDates:user.loginDates, lastotp:otp});
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
        const token = jwt.sign({ user: payLoad }, JWT_SECRET, { expiresIn: '1h' });
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

        const text = `Hello ${isUser.firstName + " " + isUser.lastName}, Somebody requested a new password for the https://teams.com account associated with ${isUser.email}.\n\n No changes have been made to your account yet.\n\nYou can reset your password by clicking the link below:\nhttp://localhost:3000/set-new-password/${token}  \n\nLink is valid for next 15 mins.\n
        If you did not request a new password, please let us know immediately by replying to this email.\n\nThanking You, \nThe Team Org`

        const subject = "Reset Password Request"

        const result = sendEmail(isUser.email, subject, text);
        console.log({ result });

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

export { createUser, acceptAccount, loginUser, sentResetPasswordMail, resetPassword, checkOTP };




