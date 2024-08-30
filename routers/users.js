const express = require("express");
const postgresClient = require("../config/db.js");
const jwt = require("jsonwebtoken");
const Nexmo = require("nexmo");
const auth = require("../middleware/auth.js");
require("dotenv").config();

const router = express.Router();
const table = "users";

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_KEY,
  apiSecret: process.env.NEXMO_SECRET,
});

//#region Post

// Create user
// params: none
// body: email, password, fullname, type, phone_no, country, province, district
router.post("/sign_in", async (req, res) => {
  try {
    const b = req.body;
    const text =
      `INSERT INTO ${table} ` +
      `(email, password, fullname, type, phone_no, country, province, district) ` +
      `VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, $6, $7, $8)`;

    const values = [b.email, b.password, b.fullname, 0, b.phone_no, b.country, b.province, b.district];
    await postgresClient.query(text, values);
    return res.status(201).json({ message: "Successful" });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// Login
// params: none
// body: email, password
router.post("/login", async (req, res) => {
  try {
    var text =
      `SELECT ` +
      `id, ` +
      `email, ` +
      `fullname, ` +
      `access_token, ` +
      `phone_no, ` +
      `authority, ` +
      `type, ` +
      `country, ` +
      `province, ` +
      `district ` +
      `FROM ${table} ` +
      `WHERE email = $1 ` +
      `AND ` +
      `password = crypt($2, password)`;

    var values = [req.body.email, req.body.password];

    var user = (await postgresClient.query(text, values)).rows[0];
    if (user == null) {
      return res.status(404).json({ message: "failed" });
    }
    const string_id = String(user.id);
    const payload = {
      id: string_id,
      type: user.type,
    };
    const options = { expiresIn: "1 day" };
    var token = jwt.sign(payload, process.env.JSON_SECRET, options);
    user.access_token = token;

    var updateSql = `UPDATE ${table} SET access_token = $1 WHERE id = $2`;
    var updateValues = [token, user.id];
    await postgresClient.query(updateSql, updateValues);
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// Token login
// params: none
// body: access_token
router.post("/token_login", [auth], async (req, res) => {
  try {
    var text = `SELECT * FROM ${table} WHERE access_token = $1`;
    var values = [req.body.access_token];

    const { rows } = await postgresClient.query(text, values);
    if (!rows.length) {
      return res.status(404).json();
    }

    const string_id = String(rows[0].id);
    const payload = {
      id: string_id,
      type: rows[0].type,
    };
    const options = { expiresIn: "1 day" };
    var token = jwt.sign(payload, process.env.JSON_SECRET, options);

    var updateSql =
      `UPDATE ${table} ` +
      `SET access_token = $1 ` +
      `WHERE id = $2 ` +
      `RETURNING ` +
      `id, ` +
      `email, ` +
      `fullname, ` +
      `access_token, ` +
      `phone_no, ` +
      `authority, ` +
      `type, ` +
      `country, ` +
      `province, ` +
      `district `;
    var updateValues = [token, rows[0].id];
    const userRes = await postgresClient.query(updateSql, updateValues);
    return res.status(200).json(userRes.rows[0]);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// Get users
// params: none
// body: ids(user_id)
router.post("/with_ids", [auth], async (req, res) => {
  try {
    var text =
      `SELECT ` +
      `id, email, fullname, phone_no, authority, type ` +
      `FROM ${table} ` +
      `WHERE id IN (${req.body.ids})`;
    const { rows } = await postgresClient.query(text);
    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

//#endregion

//#region Put

// change authority
// params: none
// body: id, type, authority
router.put("/authority", [auth], async (req, res) => {
  try {
    const body = req.body;
    if (req.user.type <= body.type) return res.status(400).json({ message: "Don't have permission" });

    const text = `UPDATE ${table} SET authority = $1 WHERE id = $2`;
    const values = [body.authority, body.id];
    await postgresClient.query(text, values);

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// change password
// params: id
// body: password, newPassword
router.put("/change_password/:id", [auth], async (req, res) => {
  try {
    const { id } = req.params;
    const text = `UPDATE ${table} SET password = crypt($1, gen_salt('bf')) WHERE id = $2 AND password = crypt($3, password) RETURNING id`;
    const values = [req.body.newPassword, id, req.body.password];
    const { rows } = await postgresClient.query(text, values);
    if (!rows.length) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// change email
// params: id
// body: email, newEmail
router.put("/change_email/:id", [auth], async (req, res) => {
  try {
    const { id } = req.params;
    const text = `UPDATE ${table} SET email = $1 WHERE id = $2 AND email = $3 RETURNING id`;
    const values = [req.body.newEmail, id, req.body.email];
    const { rows } = await postgresClient.query(text, values);
    if (!rows.length) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("Error occured", error.message);

    return res.status(400).json({ message: error.message });
  }
});

// change location
// params: id
// body: country, province, district
router.put("/change_location/:id", [auth], async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body;
    const text = `UPDATE ${table} SET country = $1, province = $2, district = $3  WHERE id = $4 RETURNING id`;
    const values = [b.country, b.province, b.district, id];
    const { rows } = await postgresClient.query(text, values);
    if (!rows.length) {
      return res.status(404).json({ message: "user not found!" });
    }
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("Error occured", error.message);

    return res.status(400).json({ message: error.message });
  }
});

router.put("/phone/:id", [auth], async (req, res) => {
  try {
    const { id } = req.params;
    const text = "UPDATE users SET phone_no = $1 WHERE id = $2 AND phone_no = $3 RETURNING *";
    const values = [req.body.phoneNo, id, req.body.oldPhoneNo];

    const { rows } = await postgresClient.query(text, values);
    if (!rows.length) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// reset password
// params: id
// body: password
router.put("/reset_password/:id", [auth], async (req, res) => {
  try {
    const text = `UPDATE ${table} SET password = crypt($1, gen_salt('bf')) WHERE id = $2`;
    const values = [req.body.password, req.params.id];
    await postgresClient.query(text, values);
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// set data
// params: id, column
// body: data
router.put("/data/:id/:column", [auth], async (req, res) => {
  try {
    const column = req.params.column;
    if (column == "password" || column == "access_token" || column == "authority" || column == "type") {
      return res.status(404).json({ message: "Can't accessible" });
    }

    const text = `UPDATE ${table} SET ${column} = $1 WHERE id = $2`;
    const values = [req.body.data, req.params.id];
    await postgresClient.query(text, values);
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

//#endregion

//#region Get

// Get users
router.get("/", [auth], async (req, res) => {
  try {
    const text = `SELECT id, email, fullname, phone_no, authority, type FROM ${table} ORDER BY id ASC`;
    const { rows } = await postgresClient.query(text);
    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// has email
// params: email
// body: none
// return: user_id
router.get("/has_email/:email", [auth], async (req, res) => {
  try {
    const text = `SELECT id FROM ${table} WHERE email = $1`;
    const values = [req.params.email];
    const { rows } = await postgresClient.query(text, values);
    if (!rows.length) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ id: rows[0].id });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// has phone
// params: phoneNo
// body: none
// return: user_id
router.get("/has_phone/:phoneNo", [auth], async (req, res) => {
  try {
    const text = `SELECT id FROM ${table} WHERE phone_no = $1`;
    const values = [req.params.phoneNo];
    const { rows } = await postgresClient.query(text, values);
    if (!rows.length) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ id: rows[0].id });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// get data
// params: id, column
// body: none
// return: column_data
router.get("/data/:id/:column", [auth], async (req, res) => {
  try {
    const column = req.params.column;

    if (column == "password" || column == "access_token") {
      log.message_with_request(req, false, null, explanation, table);
      return res.status(404).json({ message: "Can't accessible" });
    }

    const text = `SELECT ${req.params.column} FROM ${table} WHERE id = $1`;
    const values = [req.params.id];
    const { rows } = await postgresClient.query(text, values);
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// get user
// params: id
// body: none
// return: user
router.get("/:id", [auth], async (req, res) => {
  try {
    const text = `SELECT id, email, fullname, type, phone_no, authority FROM ${table} WHERE id = $1`;
    const values = [req.params.id];
    const { rows } = await postgresClient.query(text, values);
    if (!rows.length) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

//#endregion

//#region Delete

// delete user
// params: id
// body: none
// return: none
router.delete("/:id", [auth], async (req, res) => {
  try {
    const text = `DELETE FROM ${table} WHERE id = $1`;
    const values = [req.params.id];

    await postgresClient.query(text, values);
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

//#endregion

module.exports = router;
