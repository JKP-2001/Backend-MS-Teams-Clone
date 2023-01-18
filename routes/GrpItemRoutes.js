import checkAdmin from "../middlewares/checkAdmin.js";
import express from "express";
const grpItemRoutes = express.Router();
import { fetchUser } from "../middlewares/fetchUser.js";
import { postNewItem } from "../Controllers/GrpItemsController.js";

import multer from "multer";
import checkGrpMember from "../middlewares/checkGrpMember.js";

const file_storage = multer.diskStorage({        // function for a image storage
    destination: function (req, file, cb) {     // setting destination
        cb(null, "./uploads/files")
    },
    filename: function (req, file, cb) {        // setting specification of file
        cb(null, Date.now() + "-" + file.originalname);

    }
})

const upload = 
    multer({    //function to upload image in the destination
    storage: file_storage, limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype.split("/")[1] === "pdf") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg .jpeg .pdf format allowed!'));
        }
    }
})


// app.post("/upload_files", fetchuploadFiles);

grpItemRoutes.post("/grp/newpost",upload.array("files"),fetchUser,checkGrpMember,postNewItem)


export {grpItemRoutes}