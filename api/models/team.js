import mongoose from "mongoose";
const Schema = mongoose.Schema;

const teamSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    openTeam: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    workedOn: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Project",
        required: true,
      },
    ],
    links: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Link",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Team", teamSchema);
