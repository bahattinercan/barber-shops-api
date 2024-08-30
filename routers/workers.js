const express = require("express");
const postgresClient = require("../config/db.js");
const auth = require("../middleware/auth.js");

const router = express.Router();
const table = "workers";
const userT = "users";

//#region Post

// Create
// params : none
// body: name
router.post("/", [auth], async (req, res) => {
  try {
    const b = req.body;
    const text = `INSERT INTO ${table} (user_id, barber_shop_id) VALUES ($1, $2) RETURNING *`;
    const values = [b.user_id, b.barber_shop_id];
    const worker = (await postgresClient.query(text, values)).rows[0];

    // if this is normal user so we need to change type to 2(worker)
    const updateSql = `UPDATE ${userT} SET type = $1 WHERE id = $2 AND type = $3`;
    const updateValues = [2, worker.user_id, 1];
    await postgresClient.query(updateSql, updateValues);

    const returnSql =
      `SELECT ` +
      `${table}.id, ` +
      `${table}.user_id, ` +
      `${table}.barber_shop_id, ` +
      `encode(${table}.image, 'hex') AS image, ` +
      `${userT}.fullname, ` +
      `${userT}.phone_no ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} ` +
      `ON ${table}.user_id = ${userT}.id ` +
      `WHERE ${table}.id = $1 ` +
      `ORDER BY id ASC`;
    const returnValues = [worker.id];
    const data = (await postgresClient.query(returnSql, returnValues)).rows[0];

    return res.status(201).json(data);
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
      `${table}.barber_shop_id, ` +
      `encode(${table}.image, 'hex') AS image, ` +
      `${userT}.fullname, ` +
      `${userT}.phone_no ` +
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
router.get("/jobs/:uid", [auth], async (req, res) => {
  try {
    const text =
      `SELECT ` +
      `${table}.id, ` +
      `${table}.user_id, ` +
      `${table}.barber_shop_id, ` +
      `encode(${table}.image, 'hex') AS image, ` +
      `${userT}.fullname, ` +
      `${userT}.phone_no ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} ` +
      `ON ${table}.user_id = ${userT}.id ` +
      `WHERE ${table}.user_id = $1 ` +
      `ORDER BY id ASC`;
    const values = [req.params.uid];
    const { rows } = await postgresClient.query(text, values);
    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// get all
router.get("/job/:uid/:shopId", [auth], async (req, res) => {
  try {
    const text =
      `SELECT ` +
      `${table}.id, ` +
      `${table}.user_id, ` +
      `${table}.barber_shop_id, ` +
      `encode(${table}.image, 'hex') AS image, ` +
      `${userT}.fullname, ` +
      `${userT}.phone_no ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} ` +
      `ON ${table}.user_id = ${userT}.id ` +
      `WHERE ${table}.user_id = $1 ` +
      `AND ` +
      `${table}.barber_shop_id = $2 ` +
      `ORDER BY id ASC`;
    const values = [req.params.uid, req.params.shopId];
    const { rows } = await postgresClient.query(text, values);
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// get all
router.get("/shop_ids/:uid", [auth], async (req, res) => {
  try {
    const text = `SELECT barber_shop_id FROM ${table} WHERE user_id = $1 ORDER BY id ASC`;
    const values = [req.params.uid];
    const { rows } = await postgresClient.query(text, values);
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
      `${table}.barber_shop_id, ` +
      `encode(${table}.image, 'hex') AS image, ` +
      `${userT}.fullname, ` +
      `${userT}.phone_no ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} ` +
      `ON ${table}.user_id = ${userT}.id ` +
      `WHERE barber_shop_id = $1 ` +
      `ORDER BY id ASC`;
    const values = [req.params.shopId];
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
    const text = `DELETE FROM ${table} WHERE id = $1 RETURNING user_id`;
    const values = [req.params.id];
    const user_id = (await postgresClient.query(text, values)).rows[0].user_id;

    // if user is worker and don't have a job then change type to 1(user)
    // get job number
    const hasJobSql = `SELECT id FROM ${table} WHERE id = $1`;
    const hasJobSqlValues = [req.params.id];
    const jobNumber = (await postgresClient.query(hasJobSql, hasJobSqlValues)).rows.length;
    // check it
    if (jobNumber == 0) {
      // this user type need to be normal so we set the type 1(user)
      const updateSql = `UPDATE ${userT} SET type = $1 WHERE id = $2 AND type = $3`;
      const updateValues = [1, user_id, 2];
      await postgresClient.query(updateSql, updateValues);
    }

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

//#endregion

module.exports = router;
