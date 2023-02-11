import mongoose from "mongoose";
const submission = {
  userId: {
    type: { type: mongoose.Schema.Types.ObjectId },
  },
  material: [
    {
      type: String,
    },
  ],
  dateTime: {
    type: Date,
  },
  feedBack: {
    type: String,
  },
  points: {
    type: Number,
  },
  returned: {
    type: Date,
  },
  isReturned: {
    type: Boolean,
    default:false
  },
};
const assignmentScchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  grpId: {
    type: { type: mongoose.Schema.Types.ObjectId },
  },
  instructions: {
    type: String,
    default: "",
  },
  points: {
    type: Number,
  },
  files: {
    type: String,
  },
  turnedInBy: [{
     type: mongoose.Schema.Types.ObjectId, default: [] }],
  dueDateTime: {
    type: Date,
    required: true,
  },
  closedDateTime: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  submission: { submission },
});

const Assignment = mongoose.model("Assignment", assignmentScchema);
export {Assignment}
