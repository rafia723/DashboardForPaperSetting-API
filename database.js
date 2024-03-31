const mysql = require("mysql");

const config = {
  user: "root",
  host: "127.0.0.1",
  database: "dps",
};

const pool = new mysql.createPool(config);

module.exports = { pool };