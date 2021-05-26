import mongoose from "mongoose";
const Schema = mongoose.Schema;
import validator from "validator";

const userRoleSchema = new Schema({
  title: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.matches(value, "^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$")) {
        throw new Error(
          "Invalid title. Title can contain only ASCII letters and digits, with hyphens, underscores and spaces as internal separators."
        );
      }
    },
  },
  permissions: [
    {
      type: String,
      required: true,
      enum: ["CREATE_PROJECTS", "CREATE_TEAM"],
    },
  ],
});

export default mongoose.model("UserRole", userRoleSchema);
