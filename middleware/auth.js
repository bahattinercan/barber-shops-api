const jwt = require("jsonwebtoken");
const postgresClient = require("../config/db.js");
require("dotenv").config();
// if has authority and valid token then it can use system

async function auth(req, res, next) {
  const token = req.header("x-access-token");
  if (!token)
    return res.status(401).send({
      ok: false,
      error: "Access denied. No token provided",
    });
  try {
    const decoded = jwt.verify(token, process.env.JSON_SECRET);
    req.user = decoded;
    var text = "SELECT authority FROM users WHERE id = $1";
    var values = [decoded.id];
    const { rows } = await postgresClient.query(text, values);
    if (rows[0].authority == false) {
      return res.status(401).send({ ok: false, error: "Access denied. Don't have authority" });
    }
  } catch (error) {
    return res.status(401).send({
      ok: false,
      error: "Token expired",
    });
  }

  next();
}

module.exports = auth;
