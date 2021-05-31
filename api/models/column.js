import mongoose from "mongoose";
const Schema = mongoose.Schema;

const columnSchema = new Schema(
  {
    title: { type: String, required: true },
    tasks: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
      },
    ],
    limit: {
      type: Number,
      default: 30,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Column", columnSchema);
