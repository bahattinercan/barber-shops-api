//#region IMPORTS
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const http = require("http");
const fs = require("fs");

const postgresClient = require("./config/db.js");

const appointment_router = require("./routers/appointments.js");
const barber_shop_router = require("./routers/barber_shops.js");
const comment_router = require("./routers/comments.js");
const favourite_router = require("./routers/favourites.js");
const service_router = require("./routers/services.js");
const user_router = require("./routers/users.js");
const user_type_router = require("./routers/user_types.js");
const work_time_router = require("./routers/work_times.js");
const worker_router = require("./routers/workers.js");

//#endregion

const app = express();
app.use(express.json());

app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

app.use("/appointments", appointment_router);
app.use("/barber_shops", barber_shop_router);
app.use("/comments", comment_router);
app.use("/favourites", favourite_router);
app.use("/services", service_router);
app.use("/users", user_router);
app.use("/user_types", user_type_router);
app.use("/work_times", work_time_router);
app.use("/workers", worker_router);

const HTTPS_PORT = process.env.PORT || 5000;
const HTTP_PORT = 5001;

postgresClient.connect((err) => {
  if (err) {
    console.log("connection error", err.stack);
  } else {
    //log.message("Database connection successful");
    console.log("db connection successful");
  }
});
const options = {
  key: fs.readFileSync("certificates/key.pem"),
  cert: fs.readFileSync("certificates/cert.pem"),
};
http.createServer(options, app).listen(HTTP_PORT);
https.createServer(options, app).listen(HTTPS_PORT);
