import { fetchUser } from "../middlewares/fetchUser.js";
import express from "express";
import { groupModel } from "../Models/Group.js";
import { User } from "../models/User.js";
import { Assignment } from "../models/Assignment.js";
import {
  createAssignment,
  deleteAssignment,
  getAllAssignment,
  getAssignment,
  submitAssignment,
  turnInAssignment,
  uppdateAssignment,
} from "../controllers/AssController.js";
const assRouter = express.Router();
import multer from "multer";

const file_storage = multer.diskStorage({
  // function for a image storage
  destination: function (req, file, cb) {
    // setting destination
    cb(null, "./uploads/Assignmentfiles");
  },
  filename: function (req, file, cb) {
    // setting specification of file
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  //function to upload image in the destination
  storage: file_storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype.split("/")[1] === "pdf"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg .jpeg .pdf format allowed!"));
    }
  },
});
// Create Assignment

assRouter.post(
  "/assignment/:id",
  fetchUser,
  upload.array("assFiles"),
  createAssignment
);

// Get Assinment By Id
assRouter.get("/assignment/:id", fetchUser, getAssignment);

// Get All Assignments by grp id ---> some changes are required
assRouter.get("/allAssignment/:id", fetchUser, getAllAssignment);

// Update Assignment
assRouter.put("/assignment/:id", fetchUser, uppdateAssignment);

// Delete Assignment
assRouter.delete("/assignment/:id", fetchUser, deleteAssignment);

// Turn in Assignment
assRouter.post("/assignment/turnin/:id", fetchUser, turnInAssignment);

// Submit Assignment
assRouter.post("/assignment/submit/:id", fetchUser, submitAssignment);

export { assRouter };
