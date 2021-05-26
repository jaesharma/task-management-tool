import jwt from "jsonwebtoken";
const { User, Admin } = require("../models/index");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    let { _id, as } = decode;
    as = as.toLowerCase().trim();

    if (!as || !_id)
      return res
        .sendStatus(401)
        .send({ error: "You don't have permission for this operation." });
    let user;
    if (as === "admin") {
      user = await Admin.findOne({
        _id,
        "tokens.token": token,
      });
    } else if (as === "user") {
      user = await User.findOne({
        _id,
        "tokens.token": token,
      });
    }
    if (!user) return res.status(401).send({ error: "Please authenticate!" });
    req.user = user;
    req.as = as;
    req.token = token;
    next();
  } catch (e) {
    res.status(500).send({ error: "Internal Server Error!" });
  }
};

export default auth;
