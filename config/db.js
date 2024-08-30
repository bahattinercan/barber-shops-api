const pg = require("pg");
require("dotenv").config();

const postgresClient = new pg.Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
});

module.exports = postgresClient;
