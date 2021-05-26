import mongoose from "mongoose";
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
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
