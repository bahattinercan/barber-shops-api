const express = require("express");
const postgresClient = require("../config/db.js");
const auth = require("../middleware/auth.js");

const router = express.Router();
const table = "user_types";

//#region Post

// Create
// params : none
// body: name
router.post("/", [auth], async (req, res) => {
  try {
    const b = req.body;
    const text = `INSERT INTO ${table} (name) VALUES ($1) RETURNING *`;
    const values = [b.name];
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
