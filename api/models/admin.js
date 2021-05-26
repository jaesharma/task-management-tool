import mongoose from "mongoose";
const Schema = mongoose.Schema;
import validator from "validator";
import bcrypt from "bcryptjs";
import { Admin } from ".";
import jwt from "jsonwebtoken";
import { validatePassword } from "../utils/utilityFunctions";

const adminSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.matches(value, "^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$")) {
          throw new Error("Invalid username");
        }
      },
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value))
          throw new Error("Invalid Email Address!");
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    otp: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign(
    {
      _id: this._id.toString(),
      as: "admin",
    },
    process.env.JWT_SECRET
  );
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

adminSchema.pre("save", async function (next) {
  const admin = this;

  if (admin.isModified("password")) {
    const isValid = validatePassword(admin.password);
    if (isValid.status === "invalid") {
      const err = new Error();
      err.message = isValid.error;
      err.name = "Password Invalidation";
      throw err;
    }
    admin.password = await bcrypt.hash(admin.password, 8);
  }
  next();
});

adminSchema.pre("updateOne", async function (next) {
  const admin = this;

  if (admin._update.password) {
    const isValid = validatePassword(admin._update.password);
    if (isValid.status === "invalid") {
      const err = new Error();
      err.message = isValid.error;
      err.name = "Password Invalidation";
      throw err;
    }
    admin._update.password = await bcrypt.hash(admin._update.password, 8);
  }
  next();
});

adminSchema.statics.findByCredentials = async ({ email, password, res }) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error("Bad Credentials!");
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error("Bad Credentials!");
  return admin;
};

adminSchema.methods.toJSON = function () {
  const admin = this.toObject();
  delete admin.password;
  delete admin.tokens;
  delete admin.otp;
  return admin;
};

export default mongoose.model("Admin", adminSchema);
