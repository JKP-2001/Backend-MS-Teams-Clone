import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import nodemailer from "nodemailer";
import { getDate } from "../functions.js";

const saltRound = 10;
const JWT_SECRET = process.env.JWT_SECRET;


const sendEmail = (receiver, subject, text) => {
    var transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        tls: {
            ciphers: 'SSLv3'
        },
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // setup e-mail data, even with unicode symbols
    var mailOptions = {
        from: `"Teams Org " ${process.env.EMAIL}`, // sender address (who sends)
        to: receiver, // list of receivers (who receives)
        subject: subject, // Subject line
        text: text, // plaintext body
        // html: htmlBody // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (res, error, info) {
        if (error) {
            return console.log(error);
        }

        console.log('Message sent: ' + info.response);
        // console.log('Message sent')
    });
}


const createUser = async (req, res) => {
    try{
        const user = await User.findOne({email:req.body.email});
        if(user){
            throw new Error("Email already taken.");
        }

        const payLoad = {
            name:req.body.name,
            email:req.body.email
        };

        const token = jwt.sign({user:payLoad},JWT_SECRET);

        const text = `Hello ${req.body.name},\n\nThank you for showing intrest in https://teams.com. To finish signing up, you just need to confirm your email by clicking the link below.\n\nhttp://localhost:5000/teams_clone/v1/account/accept/${token}\n\nThank You\nTeam Org.`

        const subject = "Confirm your account on Teams"

        const result = await sendEmail(payLoad.email, subject,text);

        res.status(200).send({"success":true, "email":"Sent"});
        return;

    }catch(err){
        res.status(400).json({success:false, details:err.toString()});
    }
}

const acceptAccount = async(req,res)=>{
    try{
        const token = req.params.token;
        if(!token){
            throw new Error("Not A Valid Url");
        }
        const decode = jwt.verify(token,JWT_SECRET);
        const hashPassword = await bcrypt.hash(req.body.password, saltRound);
        const currDateTime = getDate();
        const newUser = await User.create({
            name:decode.user.name,
            email:decode.user.email,
            password:hashPassword,
            role:['Student'],
            creationDateAndTime:currDateTime
        })
        res.status(200).json({success:true, newUser}); 

    }catch(err){
        res.status(400).json({success:false, detail:err.toString()})
    }
}

const loginUser = async (req,res)=>{
    try {
        const body = req.body;
        const user = await User.findOne({email:body.email});
        if(!user){
            throw new Error("User not found");
        }

        const payLoad = {
            email:user.email,
            role:user.role
        }

        const isUser = await bcrypt.compare(body.password, user.password);

        if(isUser){
            const token = jwt.sign({user:payLoad}, JWT_SECRET);
            const currDateTime = getDate();
            user.loginDates.push(currDateTime);
            
            const updateLastLogin = await User.findByIdAndUpdate(user._id,{loginDates:user.loginDates});

            res.status(200).json({success:true, token:token}); 
            return;
        }

        throw new Error("Incorrect Password");

    } catch (err) {
        res.status(400).json({success:false, detail:err.toString()})
    }
}

const sentResetPasswordMail = async (req,res)=>{
    try {
        const email = req.body.email;
        const isUser = await User.findOne({email:email});
        if(!isUser){
            throw new Error("User Not Found.")
        }

        const security = await bcrypt.hash("thisisforpasswordcheck",10);
        const payLoad = {
            id:isUser._id,
            check:security
        };

        const token = jwt.sign({user:payLoad},JWT_SECRET);

        const text = `Hello ${isUser.name}, Somebody requested a new password for the https://teams.com account associated with ${isUser.email}.\n\n No changes have been made to your account yet.\n\nYou can reset your password by clicking the link below:\nhttp://localhost:5000/teams_clone/v1/account/reset/${token}  \n\nIf you did not request a new password, please let us know immediately by replying to this email.\n\n Thank You, \nThe Team Org`

        const subject = "Reset Password Request"

        const result = await sendEmail(isUser.email, subject,text);

        res.status(200).send({"success":true, "email":"Sent"});
        return;


    } catch (err) {
        res.status(400).json({success:false, detail:err.toString()})
    }
}


const resetPassword = async (req,res)=>{
    try{
        const id = req.params.id;
        const decode = jwt.verify(id,JWT_SECRET);
        console.log(decode);
        const _id = decode.user.id;

        const user = await User.findOne({_id:_id});
        if(!user){
            throw new Error("User not found");
        }   

        if(user.checkReset === decode.user.check){
            throw new Error("Link Already Used.");
        }

        const newHashPassword = await bcrypt.hash(req.body.password, 10);

        const updatePass = await User.findByIdAndUpdate(_id,{password:newHashPassword, checkReset:decode.user.check});

        res.status(200).json({"success":true, details:updatePass});
        return;

    }catch(err){
        res.status(400).json({success:false, detail:err.toString()})
    }
}

export {createUser, acceptAccount, loginUser, sentResetPasswordMail, resetPassword};




