const express = require("express");
const postgresClient = require("../config/db.js");
const auth = require("../middleware/auth.js");

const router = express.Router();
const table = "comments";
const userT = "users";

//#region Post

// Create
// params : none
// body: name
router.post("/", [auth], async (req, res) => {
  try {
    const b = req.body;
    // create comment
    const text = `INSERT INTO ${table} (user_id, comment, time, barber_shop_id, stars) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [b.user_id, b.comment, b.time, b.barber_shop_id, b.stars];
    const { rows } = await postgresClient.query(text, values);
    // calculate star average and get
    const starAverageSql = `SELECT SUM(stars) / COUNT(*) AS average FROM ${table} WHERE barber_shop_id = $1`;
    const starAverageValues = [b.barber_shop_id];
    const starAverageRes = await postgresClient.query(starAverageSql, starAverageValues);
    // update star average and comments_number on shops table
    const updateStarSql = `UPDATE barber_shops SET comments = comments + 1, star_average = $1 WHERE id = ${b.barber_shop_id}`;
    const updateStarValues = [starAverageRes.rows[0].average];
    await postgresClient.query(updateStarSql, updateStarValues);
    // return comment
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// set data
// params: none
// body: comment, time, barber_shop_id, stars, user_id
router.post("/update", [auth], async (req, res) => {
  try {
    const b = req.body;
    // update comment
    const text = `UPDATE ${table} SET comment = $1, time = $2, barber_shop_id = $3, stars = $4 WHERE user_id = $5 RETURNING *`;
    const values = [b.comment, b.time, b.barber_shop_id, b.stars, b.user_id];
    const { rows } = await postgresClient.query(text, values);
    // calculate star average and get
    const starAverageSql = `SELECT SUM(stars) / COUNT(*) AS average FROM ${table} WHERE barber_shop_id = $1`;
    const starAverageValues = [b.barber_shop_id];
    const starAverageRes = await postgresClient.query(starAverageSql, starAverageValues);
    // update star average and comments_number on shops table
    const updateStarSql = `UPDATE shops SET star_average = $1 WHERE id = ${b.barber_shop_id}`;
    const updateStarValues = [starAverageRes.rows[0].average];
    await postgresClient.query(updateStarSql, updateStarValues);
    // return comment
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

//#endregion

//#region Put

// set data
// params: id, column
// body: data
router.put("/data/:id/:column", [auth], async (req, res) => {
  try {
    const text = `UPDATE ${table} SET ${req.params.column} = $1 WHERE id = $2`;
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

// get all
router.get("/", [auth], async (req, res) => {
  try {
    const text =
      `SELECT ` +
      `${table}.id, ` +
      `${table}.user_id, ` +
      `${table}.comment, ` +
      `${table}.barber_shop_id, ` +
      `${table}.stars, ` +
      `${table}.time, ` +
      `${userT}.fullname AS fullname ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} ` +
      `ON ${table}.user_id = ${userT}.id ` +
      `ORDER BY id ASC`;
    const { rows } = await postgresClient.query(text);
    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// get all
router.get("/shop/:shopId", [auth], async (req, res) => {
  try {
    const text =
      `SELECT ` +
      `${table}.id, ` +
      `${table}.user_id, ` +
      `${table}.comment, ` +
      `${table}.barber_shop_id, ` +
      `${table}.stars, ` +
      `${table}.time, ` +
      `${userT}.fullname AS fullname ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} ` +
      `ON ${table}.user_id = ${userT}.id ` +
      `WHERE ${table}.barber_shop_id = $1 ` +
      `ORDER BY id ASC`;
    const values = [req.params.shopId];
    const { rows } = await postgresClient.query(text, values);
    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// get star average
router.get("/star_average/:shopId", [auth], async (req, res) => {
  try {
    const text = `SELECT SUM(stars) / COUNT(*) AS average FROM ${table} WHERE barber_shop_id = $1`;
    const values = [req.params.shopId];
    const { rows } = await postgresClient.query(text, values);
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// Get data with id
router.get("/data/:id/:column", [auth], async (req, res) => {
  try {
    const text = `SELECT ${req.params.column} FROM ${table} WHERE id = $1`;
    const values = [req.params.id];
    const { rows } = await postgresClient.query(text, values);
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

router.get("/user/:id", [auth], async (req, res) => {
  try {
    const text =
      `SELECT ` +
      `${table}.id, ` +
      `${table}.user_id, ` +
      `${table}.comment, ` +
      `${table}.barber_shop_id, ` +
      `${table}.stars, ` +
      `${table}.time, ` +
      `${userT}.fullname AS fullname ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} ` +
      `ON ${table}.user_id = ${userT}.id ` +
      `WHERE ${table}.user_id = $1 ` +
      `ORDER BY id ASC`;
    const values = [req.params.id];
    const { rows } = await postgresClient.query(text, values);
    if (!rows.length) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ rows });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

router.get("/:id", [auth], async (req, res) => {
  try {
    const text =
      `SELECT ` +
      `${table}.id, ` +
      `${table}.user_id, ` +
      `${table}.comment, ` +
      `${table}.barber_shop_id, ` +
      `${table}.stars, ` +
      `${table}.time, ` +
      `${userT}.fullname AS fullname ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} ` +
      `ON ${table}.user_id = ${userT}.id ` +
      `WHERE ${table}.id = $1 ` +
      `ORDER BY id ASC`;
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

router.delete("/:id", [auth], async (req, res) => {
  try {
    // delete
    const text = `DELETE FROM ${table} WHERE id = $1 RETURNING barber_shop_id`;
    const values = [req.params.id];
    const { rows } = await postgresClient.query(text, values);
    const barber_shop_id = rows[0].barber_shop_id;
    // calculate star average and get
    const starAverageSql = `SELECT SUM(stars) / COUNT(*) AS average FROM ${table} WHERE barber_shop_id = $1`;
    const starAverageValues = [barber_shop_id];
    const starAverageRes = await postgresClient.query(starAverageSql, starAverageValues);
    // update star average and comments_number on shops table
    const updateStarSql = `UPDATE shops SET comments = comments - 1, star_average = $1 WHERE id = ${barber_shop_id}`;
    const updateStarValues = [starAverageRes.rows[0].average];
    await postgresClient.query(updateStarSql, updateStarValues);
    // return comment;
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

//#endregion

module.exports = router;
