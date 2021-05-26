import express from "express";
import auth from "../middlewares/auth";
const router = new express.Router();

router.get("/profile", auth, async (req, res) => {
  try {
    let profile = req.user;
    return res.send({ profile, as: req.as });
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});

export default router;
