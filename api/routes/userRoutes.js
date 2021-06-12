import express from "express";
import auth from "../middlewares/auth";
import authAsAdmin from "../middlewares/authAsAdmin";
import authAsUser from "../middlewares/authAsUser";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Admin, User, UserRole } from "../models/index";
import generatePassword from "password-generator";
import user from "../models/user";
const ObjectId = require("mongoose").Types.ObjectId;
const router = new express.Router();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get("/", auth, async (req, res) => {
  try {
    let { order, orderBy = "username", limit, skip = 0, search } = req.query;
    if (orderBy === "joined") orderBy = "createdAt";
    if (orderBy === "role") orderBy = "userRole";
    limit = +limit;
    skip = +skip;
    if (!limit || limit < 0) limit = 5;
    const optionalMatches = [];

    if (search && search.length) {
      optionalMatches.push({
        $match: {
          name: {
            $regex: new RegExp(`^(${search})`, "i"),
          },
        },
      });
    }

    const users = await User.aggregate([
      ...optionalMatches,
      {
        $lookup: {
          from: "userroles",
          as: "userRole",
          localField: "userRole",
          foreignField: "_id",
        },
      },
      {
        $unwind: "$userRole",
      },
      {
        $project: {
          password: 0,
          tokens: 0,
        },
      },
      {
        $sort: {
          [orderBy]: order === "asc" ? 1 : -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    let total;
    if (search && search.length) {
      total = await User.find({
        name: new RegExp(`^(${search})`, "i"),
      }).count();
    } else {
      total = await User.count();
    }

    res.send({
      users,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.get("/roles", auth, async (req, res) => {
  try {
    const roles = await UserRole.find({});
    res.send({ roles });
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email = "", password = "" } = req.body;
    if (!email.trim() || !password) {
      return res.status(400).send({
        error: "Email and password are required for login!",
      });
    }
    const user = await User.findOne({
      email,
    }).populate("projects.project");
    if (!user) {
      return res.status(404).send({
        error: "Invalid Email Address!",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ error: "wrong password" });

    const token = await user.generateAuthToken();
    let userObj = user.toObject();
    delete userObj.tokens;
    res.json({
      user: userObj,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.post("/role", authAsAdmin, async (req, res) => {
  try {
    const { title, permissions = [] } = req.body;
    if (!title) {
      return res.status(400).send({
        error: "title and permissions array required to create new role.",
      });
    }
    const role = await UserRole.create({ title, permissions });
    await role.save();
    res.send({ role });
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      return res
        .status(400)
        .send({ error: "role with same title already exist." });
    }

    if (error.name === "ValidationError") {
      return res.status(400).send({
        error:
          "Invalid title. Choose only alphanumeric letter with _ or - as separators.",
      });
    }
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.post("/invite", authAsAdmin, async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role)
      return res
        .status(400)
        .send({ error: "email & role must be specified to invite user." });
    if (!ObjectId.isValid(role))
      return res.status(400).send({ error: "Invalid role!" });
    const roleExists = await UserRole.count({ _id: role });
    if (roleExists <= 0) {
      return res.status(400).send({ error: "Invalid role!" });
    }
    const emailAlreadyInUse = await Admin.findOne({ email });
    if (!!emailAlreadyInUse) {
      return res.status(400).send({ error: "Email already in use." });
    }
    let usernameExists = 1;
    let username;
    while (usernameExists > 0) {
      username = Math.floor(Math.random() * 1000000);
      usernameExists = await User.count({ username });
    }
    const name = username;

    const password = generatePassword(8, false) + "A$112233";

    const newUser = await User.create({
      username,
      name,
      email,
      password,
      userRole: role,
    });
    await newUser.save();
    const msg = {
      to: email,
      from: `sjay05305@gmail.com`,
      subject: "You are invited to join Task Management Portal",
      text: "Credentials",
      html: `
         <strong>Task Management Portal</strong><br>
         You are invited to join the task management portal.<br>
         Here are your credentials:<br>
         <b>Email: </b> <span>${email}</span><br>
         <b>Password: </b> <span>${password}</span><br>
         Note: Do not share your credentials with anyone.<br>
      `,
    };

    sgMail
      .send(msg)
      .then(() => {
        const user = newUser.toObject();
        delete user.password;
        delete user.tokens;
        res.send({ user });
      })
      .catch((error) => {
        return res.status(500).send({ error: "Internal Server Error!" });
      });
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      return res
        .status(400)
        .send({ error: "someone already using this email." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).send({ error: error.message });
    }
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.post("/resend", authAsAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).send({ error: "email is required field." });
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: "No user with this email exists." });
    }
    const password = generatePassword(8, false) + "A$112233";
    await user.updateOne({ password });

    const msg = {
      to: email,
      from: `sjay05305@gmail.com`,
      subject: "Your Task Management Portal's credentails has been changed.",
      text: "Credentials",
      html: `
         <strong>Task Management Portal</strong><br>
         Admin has changed your credentials on task management tool. Your old credentials will not be valid anymore.<br>
         <b>New Credentials:<b><br>
         <b>Email: </b> <span>${email}</span><br>
         <b>Password: </b> <span>${password}</span><br>
         Note: Do not share your credentials with anyone.<br>
      `,
    };

    sgMail
      .send(msg)
      .then(() => {
        res.send();
      })
      .catch((error) => {
        return res.status(500).send({ error: "Internal Server Error!" });
      });
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      return res
        .status(400)
        .send({ error: "someone already using this email." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).send({ error: error.message });
    }
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.post("/delete", authAsAdmin, async (req, res) => {
  try {
    let { users = [] } = req.body;
    users = users.map((user) => mongoose.Types.ObjectId(user));
    await User.deleteMany({
      _id: {
        $in: users,
      },
    });
    res.send();
  } catch (error) {
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.patch("/", authAsUser, async (req, res) => {
  try {
    const {
      name = req.user.name,
      username = req.user.username,
      jobTitle = req.user.about?.jobTitle,
      department = req.user.about?.department,
      organization = req.user.about?.organization,
      location = req.user.about.location,
      email = req.user.email,
    } = req.body;
    const updates = {
      name,
      username,
      email,
      about: {
        jobTitle,
        department,
        organization,
        location,
      },
    };
    await req.user.updateOne({ ...updates });
    const profile = await User.findById(req.user._id).populate(
      "projects.project"
    );
    res.send({ profile });
  } catch (error) {
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.patch("/role", authAsAdmin, async (req, res) => {
  try {
    let { id, title, permissions = [] } = req.body;
    if (!title.trim())
      return res.status(400).send({ error: "Empty titles are not allowed." });
    if (!id || !mongoose.Types.ObjectId(id))
      return res.status(400).send({ error: "Invalid role id" });
    const role = await UserRole.findById(id);
    if (!role) return res.status(404).send({ error: "Role not found!" });
    await role.updateOne({ title, permissions });
    const updatedRole = await UserRole.findById(id);
    res.send({ role: updatedRole });
  } catch (error) {
    console.log(error);
    if (error.name === "MongoError" && error.code === 11000) {
      return res
        .status(400)
        .send({ error: "role with this title already exist." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).send({ error: error.message });
    }
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.patch("/:uid", authAsAdmin, async (req, res) => {
  try {
    const { roleId } = req.body;
    const { uid } = req.params;
    console.log(uid);
    const user = await User.findById(uid);
    if (!user) return res.status(404).send({ error: "user not found." });
    await user.updateOne({ userRole: roleId });
    const updatedUser = await User.findById(uid).populate("userRole");
    res.send({ user: updatedUser });
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      return res.status(400).send({ error: error.message });
    }
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.get("/csv", authAsAdmin, async (req, res) => {
  try {
    let { users, roles = [] } = req.query;
    roles = roles.map((role) => {
      if (!ObjectId.isValid(role))
        res.status(400).send({ error: "Invalid role id." });
      return mongoose.Types.ObjectId(role);
    });
    let fetchedUsers = [];
    if (users === "all") {
      fetchedUsers = await User.find({}).populate("userRole");
    }
    if (users === "selected") {
      fetchedUsers = await User.aggregate([
        {
          $match: {
            userRole: {
              $in: roles,
            },
          },
        },
        {
          $lookup: {
            from: "userroles",
            as: "userRole",
            localField: "userRole",
            foreignField: "_id",
          },
        },
        {
          $unwind: "$userRole",
        },
      ]);
    }
    res.send(fetchedUsers);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).send({ error: error.message });
    }
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

export default router;
