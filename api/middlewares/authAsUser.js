import jwt from "jsonwebtoken";
const { User } = require("../models/index");

const authAsUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    let { _id, as } = decode;
    as = as.toLowerCase().trim();

    if (!as || !_id || as !== "user")
      return res
        .sendStatus(401)
        .send({ error: "You don't have permission for this operation." });
    const user = await User.findOne({
      _id,
      "tokens.token": token,
    }).populate("projects.project");
    if (!user) return res.status(401).send({ error: "Please authenticate!" });
    req.user = user;
    req.as = as;
    req.token = token;
    next();
  } catch (e) {
    res.status(500).send({ error: "Internal Server Error!" });
  }
};

export default authAsUser;
