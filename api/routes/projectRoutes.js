import express from "express";
import { Schema } from "mongoose";
import auth from "../middlewares/auth";
import authAsAdmin from "../middlewares/authAsAdmin";
import authAsUser from "../middlewares/authAsUser";
import { Admin, Column, Project, Role, User, UserRole } from "../models/index";
import mongoose from "mongoose";
const ObjectId = require("mongoose").Types.ObjectId;
const router = new express.Router();

router.get("/", authAsUser, async (req, res) => {
  try {
    await req.user.populate("projects");
    res.send({ projects: req.user.projects });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.post("/", authAsUser, async (req, res) => {
  try {
    const { title = "" } = req.body;
    if (!title.trim().length)
      return res
        .status(400)
        .send({ error: "title required to create a project." });
    const todo = await Column({ title: "todo" });
    await todo.save();
    const inprogress = await Column({ title: "in progress" });
    await inprogress.save();
    const done = await Column({ title: "done" });
    await done.save();
    let lead = await Role.findOne({ title: "lead" });
    if (!lead) {
      lead = await Role({
        title: "lead",
        permissions: [
          "CREATE_JOB",
          "DELETE_JOB",
          "ASSIGN_JOB",
          "ADD_MEMBERS",
          "REMOVE_MEMBERS",
        ],
      });
      await lead.save();
    }
    const member = {
      member: req.user._id,
      roles: [lead._id],
    };
    const project = await Project({
      title,
      members: [member],
      columns: [todo._id, inprogress._id, done._id],
    });
    await project.save();
    res.send({ project });
  } catch (error) {
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

export default router;
