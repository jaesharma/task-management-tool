import mongoose from "mongoose";
const Schema = mongoose.Schema;

const linkSchema = new Schema({
  address: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Link", linkSchema);
