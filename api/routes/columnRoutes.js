import express from "express";
import authAsUser from "../middlewares/authAsUser";
import mongoose from "mongoose";
import authAsAdmin from "../middlewares/authAsAdmin";
import { Project, Column } from "../models";
const ObjectId = mongoose.Types.ObjectId;
const router = new express.Router();

router.post("/create", authAsUser, async (req, res) => {
  try {
    const { title, projectId } = req.body;
    if (!title || !projectId || !ObjectId.isValid(projectId))
      return res.status(400).send({ error: "Invalid inputs." });
    const project = await Project.findOne({ _id: projectId }).populate([
      "members.roles",
    ]);
    if (!project)
      return res.status(404).send({ error: "Project does not exist." });

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

    const col = Column({
      title,
      order: project.columns.length + 1,
    });
    await col.save();
    await project.updateOne({ $push: { columns: col } });
    return res.send({ column: col });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

export default router;