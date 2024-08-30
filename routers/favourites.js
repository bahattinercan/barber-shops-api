const express = require("express");
const postgresClient = require("../config/db.js");
const auth = require("../middleware/auth.js");

const router = express.Router();
const table = "favourites";

//#region Post

// Create
// params : none
// body: user_id,barber_shop_id
router.post("/", [auth], async (req, res) => {
  try {
    const b = req.body;
    const text = `INSERT INTO ${table} (user_id,barber_shop_id) VALUES ($1, $2) RETURNING *`;
    const values = [b.user_id, b.barber_shop_id];
    const { rows } = await postgresClient.query(text, values);
    return res.status(201).json(rows[0]);
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
    const text = `SELECT * FROM ${table} ORDER BY id ASC`;
    const { rows } = await postgresClient.query(text);
    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

router.get("/my/:userId", [auth], async (req, res) => {
  try {
    const text = `SELECT * FROM ${table} WHERE user_id = $1 ORDER BY id ASC`;
    const values = [req.params.userId];
    const { rows } = await postgresClient.query(text, values);
    return res.status(200).json(rows);
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

// Get data with id
router.get("/is_fav/:userId/:shopId", [auth], async (req, res) => {
  try {
    const text = `SELECT id FROM ${table} WHERE user_id = $1 AND barber_shop_id = $2`;
    const values = [req.params.userId, req.params.shopId];
    const { rows } = await postgresClient.query(text, values);
    if (!rows.length) return res.status(404).json({ message: "it is not favourite" });
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

router.get("/:id", [auth], async (req, res) => {
  try {
    const text = `SELECT * FROM ${table} WHERE id = $1 `;
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
