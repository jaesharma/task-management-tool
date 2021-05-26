import mongoose from "mongoose";
const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    summary: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    subtasks: [
      {
        type: mongoose.Types.ObjectId,
        ref: "SubTask",
        required: true,
      },
    ],
    assignee: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    reporter: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
    labels: [
      {
        type: String,
      },
    ],
    comments: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
