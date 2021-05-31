import mongoose from "mongoose";
import validator from "validator";
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  title: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.matches(value, "^[a-zA-Z0-9_.-]*$")) {
        throw new Error(
          "Invalid title. Title must only contain [a-z,A-Z,0-9,_,- or ,]."
        );
      }
    },
  },
  permissions: [
    {
      type: String,
      required: true,
      enum: [
        "CREATE_JOB",
        "DELETE_JOB",
        "ASSIGN_JOB",
        "ADD_MEMBERS",
        "REMOVE_MEMBERS",
      ],
    },
  ],
});

export default mongoose.model("Role", roleSchema);
