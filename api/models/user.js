import mongoose from "mongoose";
const Schema = mongoose.Schema;
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validatePassword } from "../utils/utilityFunctions";

const userSchema = new Schema(
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
    cover: {
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
    about: {
      jobTitle: {
        type: String,
      },
      department: {
        type: String,
      },
      organisation: {
        type: String,
      },
      location: {
        type: String,
      },
    },
    projects: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Project",
        required: true,
      },
    ],
    teams: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Team",
      },
    ],
    userRole: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "UserRole",
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    lastActivity: {
      type: String,
      required: true,
      default: "-",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign(
    {
      _id: this._id.toString(),
      as: "user",
    },
    process.env.JWT_SECRET
  );
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

userSchema.pre("save", async function (next) {
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

userSchema.pre("updateOne", async function (next) {
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

userSchema.statics.findByCredentials = async ({
  email,
  username,
  password,
}) => {
  let admin;
  if (username) {
    admin = await Admin.findOne({ username });
  } else if (email) {
    admin = await Admin.findOne({ email });
  } else {
    throw new Error("use email/username to login!");
  }
  if (!admin) throw new Error("Bad Credentials!");
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error("Bad Credentials!");
  return admin;
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
};

export default mongoose.model("User", userSchema);
