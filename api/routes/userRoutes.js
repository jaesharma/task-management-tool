import express from "express";
import auth from "../middlewares/auth";
import authAsAdmin from "../middlewares/authAsAdmin";
const router = new express.Router();
import { Admin, User, UserRole } from "../models/index";
import generatePassword from "password-generator";
const ObjectId = require("mongoose").Types.ObjectId;
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get("/", auth, async (req, res) => {
  try {
    let { order, orderBy = "username", limit = 5, skip = 0 } = req.query;
    limit = +limit;
    skip = +skip;
    const users = await User.aggregate([
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
    const total = await User.count();
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
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.post("/role", authAsAdmin, async (req, res) => {
  try {
    const { title, permissions = [] } = req.body;
    if (!title || !permissions.length) {
      return res.status(400).send({
        error: "title and permissions array required to create new role.",
      });
    }
    const role = await UserRole.create({ title, permissions });
    await role.save();
    res.send({ role });
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
    console.log(error, error.code);
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
    console.log(error, error.code);
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

export default router;