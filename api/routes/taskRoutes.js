import express from "express";
import authAsUser from "../middlewares/authAsUser";
import mongoose from "mongoose";
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
      order: col.tasks.length + 1,
    });

    await newTask.save();
    await col.updateOne({ $push: { tasks: newTask._id } });
    return res.send({ task: newTask });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.post("/shift", authAsUser, async (req, res) => {
  try {
    const { scId, sOrder, dcId, dOrder } = req.body;
    console.log("=> ", scId, sOrder, dcId, dOrder);
    const sColumn = await Column.findById(scId).populate("tasks");
    if (!sColumn)
      return res.status(400).send({
        error: "Couldn't find source column.",
      });
    const dColumn = await Column.findById(dcId).populate("tasks");
    if (!dColumn)
      return res.status(400).send({
        error: "Couldn't find destination column.",
      });
    let taskToBeShifted = sColumn.tasks.find((task) => task.order === sOrder);
    await Task.update({ _id: taskToBeShifted._id }, { order: dOrder });
    await sColumn.updateOne({ $pull: { tasks: taskToBeShifted._id } });
    let ids = sColumn.tasks
      .map((task) => task._id)
      .filter((id) => id.toString() !== taskToBeShifted._id.toString());
    await Task.updateMany(
      { _id: { $in: ids }, order: { $gt: sOrder } },
      { $inc: { order: -1 } }
    );
    ids = dColumn.tasks
      .map((task) => task._id)
      .filter((id) => id.toString() !== taskToBeShifted._id.toString());
    await Task.updateMany(
      { _id: { $in: ids }, order: { $gte: dOrder } },
      { $inc: { order: 1 } }
    );

    await dColumn.updateOne({ $push: { tasks: taskToBeShifted._id } });
    const sourceColumn = await Column.findById(scId).populate({
      path: "tasks",
      options: {
        sort: {
          order: 1,
        },
      },
    });
    const destinationColumn = await Column.findById(dcId).populate({
      path: "tasks",
      options: {
        sort: {
          order: 1,
        },
      },
    });
    res.send({ sourceColumn, destinationColumn });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.delete("/:id", authAsUser, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).send({ error: "Task not found!" });
    await Task.findByIdAndRemove(id);
    const col = await Column.findOne({ tasks: { $in: id } });
    let ids = col.tasks.filter((taskId) => taskId.toString() !== id.toString());
    await col.updateOne({ $pull: { tasks: id } });
    await Task.updateMany(
      { _id: { $in: ids }, order: { $gte: task.order } },
      { $inc: { order: -1 } }
    );
    res.send({ task });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.get("/:id", authAsUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userProjects = req.user.projects.map(
      (project) => project.project._id
    );
    //check if user have access to the task
    const task = await Task.findById(id)
      .populate(["comments", "reporter", "subtasks"])
      .populate({
        path: "assignee",
        populate: ["to", "by"],
      });
    if (!task) return res.status(404).send({ error: "Task does not exist." });
    res.send({ task });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.patch("/:id", authAsUser, async (req, res) => {
  try {
    const { id } = req.params;
    let { summary, description } = req.body;
    const task = await Task.findById(id);
    if (!task) return res.status(404).send({ error: "Task not found!" });
    summary = summary?.trim()?.length ? summary.trim() : task.summary;
    description = description?.trim()?.length
      ? description.trim()
      : task.description;
    await task.updateOne({ summary, description });
    const updatedTask = await Task.findById(id)
      .populate(["comments", "reporter", "subtasks"])
      .populate({
        path: "assignee",
        populate: ["to", "by"],
      });

    res.send({ task: updatedTask });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal server error.",
    });
  }
});

export default router;
