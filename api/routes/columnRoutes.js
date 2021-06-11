import express from "express";
import authAsUser from "../middlewares/authAsUser";
import mongoose from "mongoose";
import { Project, Column, Task } from "../models";
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

    const alreadyExist = await Column.findOne({
      _id: { $in: project.columns },
      title,
    });
    if (alreadyExist) {
      return res.status(400).send({
        error: `The title ${title} already being used on this board.`,
      });
    }
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

router.patch("/:colId", authAsUser, async (req, res) => {
  try {
    const { colId } = req.params;
    const { limit } = req.body;
    if (!colId || !limit || !ObjectId.isValid(colId))
      return res.status(400).send({ error: "Invalid Input." });
    let column = await Column.findById(colId);
    if (!column) return res.status(404).send({ error: "Column Not Found!" });
    await column.updateOne({ limit });
    column = await Column.findById(colId).populate({
      path: "tasks",
      options: {
        sort: {
          order: 1,
        },
      },
    });
    res.send({ column });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.post("/delete", authAsUser, async (req, res) => {
  try {
    const { deleteColumnId, shiftToColumnId } = req.body;
    //args vaidation
    if (!ObjectId.isValid(deleteColumnId) || !ObjectId.isValid(shiftToColumnId))
      return res.status(400).send({ error: "Invalid input." });
    if (deleteColumnId === shiftToColumnId)
      return res.status(400).send({
        error: "'delete column' and 'shift to column' cannot be same.",
      });
    const deleteColumn = await Column.findById(deleteColumnId).populate({
      path: "tasks",
      options: {
        sort: {
          order: -1,
        },
      },
    });
    if (!deleteColumn)
      return res.status(404).send({ error: "Column not found!" });
    const shiftToColumn = await Column.findById(shiftToColumnId).populate({
      path: "tasks",
      options: {
        sort: {
          order: -1,
        },
      },
    });
    if (!shiftToColumn)
      return res.status(404).send({ error: "Column not found!" });

    //check for permissions
    //update task orders
    const maxOrder = shiftToColumn?.tasks?.length
      ? shiftToColumn.tasks[0].order
      : 0;
    await Task.updateMany(
      {
        _id: {
          $in: deleteColumn.tasks.map((task) => task._id),
        },
      },
      {
        $inc: {
          order: maxOrder,
        },
      }
    );
    //shift tasks
    await shiftToColumn.updateOne({
      $push: {
        tasks: deleteColumn.tasks.map((task) => task._id),
      },
    });
    //update column orders
    await Column.updateMany(
      { order: { $gt: deleteColumn.order } },
      {
        $inc: {
          order: -1,
        },
      }
    );
    //delete column
    await Column.findByIdAndDelete(deleteColumnId);
    const updatedColumn = await Column.findById(shiftToColumnId).populate({
      path: "tasks",
      options: {
        sort: {
          order: 1,
        },
      },
    });
    //return deleted column id & shifted column
    res.send({ deleted: deleteColumnId, column: updatedColumn });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

export default router;
