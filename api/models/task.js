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
    assignee: [
      {
        to: {
          type: mongoose.Types.ObjectId,
          ref: "User",
          required: true,
        },
        by: {
          type: mongoose.Types.ObjectId,
          ref: "User",
          required: true,
        },
        when: {
          type: String,
          required: true,
        },
      },
    ],
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
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);
