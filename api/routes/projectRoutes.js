import express from "express";
import { Schema } from "mongoose";
import auth from "../middlewares/auth";
import authAsAdmin from "../middlewares/authAsAdmin";
import authAsUser from "../middlewares/authAsUser";
import { Admin, Column, Project, Role, User, UserRole } from "../models/index";
import mongoose from "mongoose";
import project from "../models/project";
import user from "../models/user";
const ObjectId = mongoose.Types.ObjectId;
const router = new express.Router();

router.get("/", authAsUser, async (req, res) => {
  try {
    await req.user
      .populate("projects.project")
      .populate({
        path: "projects.project",
        populate: [
          {
            path: "members.member",
          },
          { path: "lead" },
        ],
      })
      .execPopulate();
    res.send({ projects: req.user.projects });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.get("/:pid", authAsUser, async (req, res) => {
  try {
    const { pid } = req.params;
    const userProject = req.user.projects.find(
      (project) => project.project.toString() === pid.toString()
    );
    if (!userProject)
      return res
        .status(400)
        .send({ error: "cannot find project in user's project list." });
    const project = await Project.findById(pid);
    if (!project)
      return res.status(400).send({ error: "Project does not exist." });
    await project
      .populate([
        {
          path: "columns",
          populate: [
            {
              path: "tasks",
            },
            {
              path: "tasks.subtasks",
            },
          ],
        },
      ])
      .populate({
        path: "lead",
      })
      .populate({
        path: "members.member",
      })
      .populate({
        path: "members.roles",
      })
      .execPopulate();
    res.send({ project });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.post("/", authAsUser, async (req, res) => {
  try {
    const { title = "", key = "" } = req.body;
    if (!title.trim().length)
      return res
        .status(400)
        .send({ error: "title required to create a project." });
    if (!key.trim().length)
      return res
        .status(400)
        .send({ error: "key required to create a project." });
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
      icon: "https://res.cloudinary.com/dkdut5n6y/image/upload/v1622495025/avatars/project_kfls9l.svg",
      members: [member],
      lead: req.user._id,
      columns: [todo._id, inprogress._id, done._id],
    });
    await project.save();
    await req.user.updateOne({
      $push: { projects: { project: project._id, key, starred: false } },
    });
    res.send({ project });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.post("/star", authAsUser, async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId || !projectId.length || !ObjectId.isValid(projectId)) {
      return res
        .status(400)
        .send({ error: "Invalid project id or project id not supplied." });
    }

    await req.user
      .populate("projects.project")
      .populate({
        path: "projects.project",
        populate: [
          {
            path: "members.member",
          },
          { path: "lead" },
        ],
      })
      .execPopulate();

    const projects = req.user.projects;
    let project = projects.find(
      (project) => toString(project.project._id) === toString(projectId)
    );
    if (!project)
      return res
        .status(400)
        .send({ error: "Project does not exist in user projects list." });
    await User.update(
      { _id: req.user._id, "projects._id": project._id },
      {
        $set: {
          "projects.$.starred": !Boolean(project.starred),
        },
      }
    );
    project = project.toObject();
    project = { ...project, starred: !project.starred };
    res.send({ project });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

export default router;
