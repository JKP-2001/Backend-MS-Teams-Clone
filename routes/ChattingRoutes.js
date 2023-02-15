import express from "express";
const ChattingRouter = express.Router();


import { fetchUser } from "../middlewares/fetchUser.js";
import { getConversation,getMessages,getAllConversations,sendMessage } from "../controllers/ChattingController.js";


ChattingRouter.post("/get-conversation/:id",fetchUser,getConversation);
ChattingRouter.post("/getMessages/:conv_id",fetchUser,getMessages);
ChattingRouter.post("/getAllConversations",fetchUser,getAllConversations);
ChattingRouter.post("/sendMessage",fetchUser,sendMessage);

export default ChattingRouter;