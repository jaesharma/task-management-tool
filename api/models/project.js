import mongoose from "mongoose";
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
    },
    columns: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Column",
        required: true,
      },
    ],
    labels: [
      {
        type: String,
      },
    ],
    lead: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        member: {
          type: mongoose.Types.ObjectId,
          ref: "User",
          required: true,
        },
        roles: [
          {
            type: mongoose.Types.ObjectId,
            ref: "Role",
            required: true,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
