import express from "express";
import authAsUser from "../middlewares/authAsUser";
import mongoose from "mongoose";
import authAsAdmin from "../middlewares/authAsAdmin";
import Column from "../../client/src/components/boards/Column";
import { Project } from "../models";
const ObjectId = mongoose.Types.ObjectId;
const router = new express.Router();

router.post("/create", authAsUser, async (req, res) => {
  try {
//     const { title, projectId } = req.body;
//     if (!title || !projectId || !ObjectId.isValid(projectId)) {
//       return res
//         .status(400)
//         .send({ error: "Invalid inputs." });
//     const project=await Project.find({_id: projectId})
//     if (!project)
//       return res
//         .status(400)
//         .send({ error: "Project does not exist." });
 
//     const col=Column({
//         title,
//     })
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       error: "Internal Server Error!",
//     });
//   }
});
