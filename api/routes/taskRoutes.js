import express from "express";
import authAsUser from "../middlewares/authAsUser";
import mongoose from "mongoose";
import authAsAdmin from "../middlewares/authAsAdmin";
import { Project, Column, Task } from "../models";
const ObjectId = mongoose.Types.ObjectId;
const router = new express.Router();

router.post("/create", authAsUser, async (req, res) => {
  try {
    //destructuring
    const { summary, columnId, projectId } = req.body;
    if (
      !summary.trim() ||
      !columnId ||
      !ObjectId.isValid(columnId) ||
      !projectId ||
      !ObjectId.isValid(projectId)
    )
      return res.status(400).send({ error: "Invalid inputs." });

    //find column
    const col = await Column.findOne({ _id: columnId }).populate([
      "members.roles",
    ]);
    if (!col) return res.status(404).send({ error: "Column does not exist." });

    //find project
    const project = await Project.findOne({ _id: projectId }).populate([
      "members.roles",
    ]);
    if (!project)
      return res.status(404).send({ error: "Project does not exist." });

    //check user permissions on this project
    let permissions = [];
    const member = project.members.find(
      (member) => member.member.toString() === req.user._id.toString()
    );
    member.roles.forEach((role) => {
      permissions = permissions.concat(role.permissions);
    });
    if (!permissions.includes("CREATE_JOB"))
      return res
        .status(400)
        .send({ error: "You don't have permission to perform this action." });

    //create new task
    const newTask = Task({
      summary,
      reporter: req.user._id,
    });

    await newTask.save();
    await Column.updateOne({ $push: { tasks: newTask._id } });
    return res.send({ task: newTask });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

export default router;
