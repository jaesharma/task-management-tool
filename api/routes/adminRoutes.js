import express from "express";
// import auth from "../middlewares/auth";
import bcrypt from "bcryptjs";
const router = new express.Router();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
import { Admin } from "../models/index";
import authAsAdmin from "../middlewares/authAsAdmin";
import mongoose from "mongoose";

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        error: "Email and password are required for login!",
      });
    }
    const admin = await Admin.findOne({
      email,
    });
    if (!admin) {
      return res.status(404).send({
        error: "Invalid Email Address!",
      });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).send({ error: "wrong password" });

    const token = await admin.generateAuthToken();
    let adminObj = admin.toObject();
    delete adminObj.tokens;
    res.json({
      admin: adminObj,
      token,
    });
  } catch (error) {
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.post("/sendotp", async (req, res) => {
  try {
    const { to } = req.body;

    if (!to)
      return res.status(400).send({ error: "Inputs are missing in request!" });
    const admin = await Admin.findOne({ email: to });
    if (!admin)
      return res
        .status(404)
        .send({ error: "No admin with this email exists in system!" });
    if (admin.otp && admin.otp.length) {
      return res.status(400).send({
        error: "You have recently generated an OTP. Try again after 5 minutes.",
      });
    }
    const otp = `${Math.floor(Math.random() * 1000000)}`;
    await admin.updateOne({ otp });
    const msg = {
      to,
      from: `sjay05305@gmail.com`,
      subject: "OTP for password reset",
      text: "OTP",
      html: `Here is your OTP, valid for next 5 min.<br><strong>${otp}</strong><br> <p>If you haven't requested for OTP, ignore this email.</p> `,
    };
    setTimeout(async () => {
      await admin.updateOne({ otp: "" });
    }, 300000);

    sgMail
      .send(msg)
      .then(() => {
        res.send();
      })
      .catch((error) => {
        res.status(500).send({ error: "Internal Server Error!" });
      });
  } catch (error) {
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.post("/verifyotp", async (req, res) => {
  try {
    const { otp, email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin)
      return res
        .status(404)
        .send({ error: "No admin with this email exists in system!" });
    if (admin.otp !== `${otp}`) {
      return res.status(400).send({
        error: "Invalid OTP",
      });
    } else {
      const token = await admin.generateAuthToken();
      res.send({ token, profile: admin });
    }
  } catch (error) {
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

router.post("/changepassword", authAsAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    await req.user.updateOne({ password });
    res.send();
  } catch (error) {
    if (error.name === "Password Invalidation") {
      return res.status(400).send({ error: error.message });
    }
    res.status(500).send({
      error: "Internal Server Error!",
    });
  }
});

export default router;
