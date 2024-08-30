const express = require("express");
const postgresClient = require("../config/db.js");
const auth = require("../middleware/auth.js");

const router = express.Router();
const table = "work_times";

//#region Post

// Create
// params : none
// body: (barber_shop_id, worker_id, start_time, end_time, break_start, break_end)
router.post("/", [auth], async (req, res) => {
  try {
    const b = req.body;
    // eğer çalışan önceden worker_time oluşturduysa onu sil
    const deleteSql = `DELETE FROM ${table} WHERE worker_id = $1 AND barber_shop_id = $2`;
    const deleteValues = [b.worker_id, b.barber_shop_id];
    await postgresClient.query(deleteSql, deleteValues);

    const text =
      `INSERT INTO ${table} ` +
      `(barber_shop_id, ` +
      `worker_id, ` +
      `start_time, ` +
      `end_time, ` +
      `break_start, ` +
      `break_end, ` +
      `monday, ` +
      `tuesday, ` +
      `wednesday, ` +
      `thursday, ` +
      `friday, ` +
      `saturday, ` +
      `sunday) ` +
      `VALUES ` +
      `($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ` +
      `RETURNING *`;
    const values = [
      b.barber_shop_id,
      b.worker_id,
      b.start_time,
      b.end_time,
      b.break_start,
      b.break_end,
      b.monday,
      b.tuesday,
      b.wednesday,
      b.thursday,
      b.friday,
      b.saturday,
      b.sunday,
    ];
    const work_time = (await postgresClient.query(text, values)).rows[0];
    return res.status(201).json(work_time);
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

router.get("/barber/:workerId/:shopId", [auth], async (req, res) => {
  try {
    const text = `SELECT * FROM ${table} WHERE barber_shop_id = $1 AND worker_id = $2 `;
    const values = [req.params.shopId, req.params.workerId];
    const workTime = (await postgresClient.query(text, values)).rows[0];

    // if (workTime == null) {
    //   return res.status(404).json({ message: "User not found." });
    // }
    return res.status(200).json(workTime);
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
