const express = require("express");
const postgresClient = require("../config/db.js");
const auth = require("../middleware/auth.js");

const router = express.Router();
const table = "appointments";
const userT = "users";

//#region Post

// get all

// Create appointment
// params : none
// body: (price, user_id, barber_shop_id, services, time, worker_id, worker_uid)
router.post("/", [auth], async (req, res) => {
  try {
    const b = req.body;
    const text =
      `INSERT INTO ${table} ` +
      `(price, user_id, barber_shop_id, services, time, worker_id, worker_uid) VALUES ` +
      `($1, $2, $3, $4, $5, $6, $7) ` +
      `RETURNING id`;
    const values = [b.price, b.user_id, b.barber_shop_id, b.services, b.time, b.worker_id, b.worker_uid];
    const id = (await postgresClient.query(text, values)).rows[0].id;

    // get created appointment data
    const sql =
      `SELECT ` +
      `${table}.id, ` +
      `${table}.price, ` +
      `${table}.user_id, ` +
      `${table}.barber_shop_id, ` +
      `${table}.services, ` +
      `${table}.time, ` +
      `${table}.worker_id, ` +
      `${table}.worker_uid, ` +
      `c.fullname AS customer_name, ` +
      `c.phone_no AS customer_phone, ` +
      `barber.fullname AS barber_name ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} AS c ` +
      `ON ${table}.user_id = c.id ` +
      `INNER JOIN ${userT} AS barber ` +
      `ON ${table}.worker_uid = barber.id ` +
      `WHERE ${table}.id = $1 ` +
      `ORDER BY id ASC`;
    const sqlValues = [id];
    const result = (await postgresClient.query(sql, sqlValues)).rows[0];

    return res.status(201).json(result);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

router.post("/taken_times/:shopId/:workerId", [auth], async (req, res) => {
  try {
    const b = req.body;

    const text =
      `SELECT ` +
      `time ` +
      `FROM ${table} ` +
      `WHERE ` +
      `time >= $1 AND ` +
      `time <= $2 AND ` +
      `barber_shop_id = $3 AND ` +
      `worker_id = $4 ` +
      `ORDER BY id ASC`;
    const values = [b.start_time, b.end_time, req.params.shopId, req.params.workerId];
    const { rows } = await postgresClient.query(text, values);
    return res.status(200).json(rows);
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
      `${table}.price, ` +
      `${table}.user_id, ` +
      `${table}.barber_shop_id, ` +
      `${table}.services, ` +
      `${table}.time, ` +
      `${table}.worker_id, ` +
      `${table}.worker_uid, ` +
      `c.fullname AS customer_name, ` +
      `c.phone_no AS customer_phone, ` +
      `barber.fullname AS barber_name ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} AS c ` +
      `ON ${table}.user_id = c.id ` +
      `INNER JOIN ${userT} AS barber ` +
      `ON ${table}.worker_uid = barber.id ` +
      `ORDER BY id ASC `;

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
      `${table}.price, ` +
      `${table}.user_id, ` +
      `${table}.barber_shop_id, ` +
      `${table}.services, ` +
      `${table}.time, ` +
      `${table}.worker_id, ` +
      `${table}.worker_uid, ` +
      `c.fullname AS customer_name, ` +
      `c.phone_no AS customer_phone, ` +
      `barber.fullname AS barber_name ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} AS c ` +
      `ON ${table}.user_id = c.id ` +
      `INNER JOIN ${userT} AS barber ` +
      `ON ${table}.worker_uid = barber.id ` +
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

// get all
router.get("/my/:userId", [auth], async (req, res) => {
  try {
    const text =
      `SELECT ` +
      `${table}.id, ` +
      `${table}.price, ` +
      `${table}.user_id, ` +
      `${table}.barber_shop_id, ` +
      `${table}.services, ` +
      `${table}.time, ` +
      `${table}.worker_id, ` +
      `${table}.worker_uid, ` +
      `c.fullname AS customer_name, ` +
      `c.phone_no AS customer_phone, ` +
      `barber.fullname AS barber_name ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} AS c ` +
      `ON ${table}.user_id = c.id ` +
      `INNER JOIN ${userT} AS barber ` +
      `ON ${table}.worker_uid = barber.id ` +
      `WHERE user_id = $1 ` +
      `ORDER BY id ASC`;
    const values = [req.params.userId];
    const { rows } = await postgresClient.query(text, values);
    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// get all
router.get("/worker/:workerId/:shopId", [auth], async (req, res) => {
  try {
    const text =
      `SELECT ` +
      `${table}.id, ` +
      `${table}.price, ` +
      `${table}.user_id, ` +
      `${table}.barber_shop_id, ` +
      `${table}.services, ` +
      `${table}.time, ` +
      `${table}.worker_id, ` +
      `${table}.worker_uid, ` +
      `c.fullname AS customer_name, ` +
      `c.phone_no AS customer_phone, ` +
      `barber.fullname AS barber_name ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} AS c ` +
      `ON ${table}.user_id = c.id ` +
      `INNER JOIN ${userT} AS barber ` +
      `ON ${table}.worker_uid = barber.id ` +
      `WHERE worker_id = $1 AND barber_shop_id = $2 ` +
      `ORDER BY id ASC`;
    const values = [req.params.workerId, req.params.shopId];
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
    const text =
      `SELECT ` +
      `${table}.id, ` +
      `${table}.price, ` +
      `${table}.user_id, ` +
      `${table}.barber_shop_id, ` +
      `${table}.services, ` +
      `${table}.time, ` +
      `${table}.worker_id, ` +
      `${table}.worker_uid, ` +
      `c.fullname AS customer_name, ` +
      `c.phone_no AS customer_phone, ` +
      `barber.fullname AS barber_name ` +
      `FROM ${table} ` +
      `INNER JOIN ${userT} AS c ` +
      `ON ${table}.user_id = c.id ` +
      `INNER JOIN ${userT} AS barber ` +
      `ON ${table}.worker_uid = barber.id ` +
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
