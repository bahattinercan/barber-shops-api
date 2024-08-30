const express = require("express");
const postgresClient = require("../config/db.js");
const auth = require("../middleware/auth.js");

const router = express.Router();
const table = "barber_shops";

//#region Post

// Create shop
router.post("/", [auth], async (req, res) => {
  try {
    const b = req.body;
    var imageData = null;
    if (b.profile_picture != null) imageData = new Buffer.from(b.profile_picture, "base64");
    const text =
      `INSERT INTO ${table} ` +
      `(name, description, location, phone, boss_id, instagram, country, province, district, profile_picture) ` +
      `VALUES ` +
      `($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ` +
      `RETURNING ` +
      `id, ` +
      `name, ` +
      `description, ` +
      `location, ` +
      `phone, ` +
      `boss_id, ` +
      `instagram, ` +
      `encode(profile_picture, 'hex') AS profile_picture, ` +
      `is_open, ` +
      `is_empty, ` +
      `star_average, ` +
      `comments, ` +
      `country, ` +
      `province, ` +
      `district `;
    const values = [
      b.name,
      b.description,
      b.location,
      b.phone,
      b.boss_id,
      b.instagram,
      b.country,
      b.province,
      b.district,
      imageData,
    ];
    const { rows } = await postgresClient.query(text, values);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// Get shops
router.post("/ids", [auth], async (req, res) => {
  try {
    const text =
      `SELECT id, ` +
      `name, ` +
      `description, ` +
      `location, ` +
      `phone, ` +
      `boss_id, ` +
      `instagram, ` +
      `encode(profile_picture, 'hex') AS profile_picture, ` +
      `is_open, ` +
      `is_empty, ` +
      `star_average, ` +
      `comments, ` +
      `country, ` +
      `province, ` +
      `district ` +
      `FROM ${table} ` +
      `WHERE id IN (${req.body}) ` +
      `ORDER BY id ASC`;
    const { rows } = await postgresClient.query(text);
    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// TODO yap
// Get nearby shops
router.post("/nearby", [auth], async (req, res) => {
  const b = req.body;
  try {
    const text =
      `SELECT id, ` +
      `name, ` +
      `description, ` +
      `location, ` +
      `phone, ` +
      `boss_id, ` +
      `instagram, ` +
      `encode(profile_picture, 'hex') AS profile_picture, ` +
      `is_open, ` +
      `is_empty, ` +
      `star_average, ` +
      `comments, ` +
      `country, ` +
      `province, ` +
      `district ` +
      `FROM ${table} ` +
      `WHERE country = $1 AND ` +
      `province = $2 AND ` +
      `district = $3 ` +
      `ORDER BY id ASC `;
    const values = [b.country, b.province, b.district];
    const { rows } = await postgresClient.query(text, values);

    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// TODO yap
// Get popular shops
router.post("/popular", [auth], async (req, res) => {
  const b = req.body;
  try {
    const text =
      `SELECT id, ` +
      `name, ` +
      `description, ` +
      `location, ` +
      `phone, ` +
      `boss_id, ` +
      `instagram, ` +
      `encode(profile_picture, 'hex') AS profile_picture, ` +
      `is_open, ` +
      `is_empty, ` +
      `star_average, ` +
      `comments, ` +
      `country, ` +
      `province, ` +
      `district ` +
      `FROM ${table} ` +
      `WHERE country = $1 AND ` +
      `province = $2 AND ` +
      `district = $3 ` +
      `ORDER BY star_average DESC ` +
      `LIMIT 3`;
    const values = [b.country, b.province, b.district];
    const { rows } = await postgresClient.query(text, values);
    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});
// set image
// params : id
// body: image(base 64)
router.put("/set_image/:id", [auth], async (req, res) => {
  try {
    // Decode the base64 image
    const imageData = new Buffer.from(req.body.image, "base64");
    const text = `UPDATE ${table} SET profile_picture = $1 WHERE id = $2`;
    const values = [imageData, req.params.id];
    await postgresClient.query(text, values);
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

//#endregion

//#region Put

router.put("/change_location/:id", [auth], async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body;
    const text = `UPDATE ${table} SET country = $1, province = $2, district = $3  WHERE id = $4 RETURNING id`;
    const values = [b.country, b.province, b.district, id];
    const { rows } = await postgresClient.query(text, values);
    if (!rows.length) {
      return res.status(404).json({ message: "barber shop not found" });
    }
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
    const text = `UPDATE ${table} SET ${req.params.column} = $1 WHERE id = $2`;
    const values = [req.body.data, req.params.id];
    await postgresClient.query(text, values);
    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// Add comment
// params: shopId, userId
// body: none
router.put("/add_comment/:shopId/:userId", [auth], async (req, res) => {
  try {
    const text = `UPDATE ${table} SET comments = comments + 1, star_average = $1 WHERE id = ${req.params.id}`;
    const values = [req.params.body];
    await postgresClient.query(text);
    return res.status(200).json({ message: "Comment added to shop" });
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});
//#endregion

//#region Get

// Get shops
router.get("/", [auth], async (req, res) => {
  try {
    const text =
      `SELECT id, ` +
      `name, ` +
      `description, ` +
      `location, ` +
      `phone, ` +
      `boss_id, ` +
      `instagram, ` +
      `encode(profile_picture, 'hex') AS profile_picture, ` +
      `is_open, ` +
      `is_empty, ` +
      `star_average, ` +
      `comments, ` +
      `country, ` +
      `province, ` +
      `district ` +
      `FROM ${table} ` +
      `ORDER BY id ASC`;
    const { rows } = await postgresClient.query(text);
    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// Get my shops
router.get("/my/:bossId", [auth], async (req, res) => {
  try {
    const text =
      `SELECT id, ` +
      `name, ` +
      `description, ` +
      `location, ` +
      `phone, ` +
      `boss_id, ` +
      `instagram, ` +
      `encode(profile_picture, 'hex') AS profile_picture, ` +
      `is_open, ` +
      `is_empty, ` +
      `star_average, ` +
      `comments, ` +
      `country, ` +
      `province, ` +
      `district ` +
      `FROM ${table} ` +
      `WHERE boss_id = $1 ` +
      `ORDER BY id ASC`;
    const values = [req.params.bossId];
    const { rows } = await postgresClient.query(text, values);
    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error occured", error.message);
    return res.status(400).json({ message: error.message });
  }
});

// Get worker shops
router.get("/worker/:workerId", [auth], async (req, res) => {
  try {
    const text =
      `SELECT id, ` +
      `name, ` +
      `description, ` +
      `location, ` +
      `phone, ` +
      `boss_id, ` +
      `instagram, ` +
      `encode(profile_picture, 'hex') AS profile_picture, ` +
      `is_open, ` +
      `is_empty, ` +
      `star_average, ` +
      `comments, ` +
      `country, ` +
      `province, ` +
      `district ` +
      `FROM ${table} ` +
      `WHERE worker_id = $1 ` +
      `ORDER BY id ASC`;
    const values = [req.params.workerId];
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

// Get user
router.get("/:id", [auth], async (req, res) => {
  try {
    const text =
      `SELECT id, ` +
      `name, ` +
      `description, ` +
      `location, ` +
      `phone, ` +
      `boss_id, ` +
      `instagram, ` +
      `encode(profile_picture, 'hex') AS profile_picture, ` +
      `is_open, ` +
      `is_empty, ` +
      `star_average, ` +
      `comments, ` +
      `country, ` +
      `province, ` +
      `district ` +
      `FROM ${table} ` +
      `WHERE id = $1`;
    const values = [req.params.id];
    const { rows } = await postgresClient.query(text, values);
    if (!rows.length) {
      return res.status(404).json({ message: "shops not found." });
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
