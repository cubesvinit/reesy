const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "reesy",
  charset: 'utf8mb4',
  // socketPath: '/var/run/mysqld/mysqld.sock',
});

db.connect(function (err) {
  if (err) throw err;
  console.log(" DB Connected!");
});

module.exports = db;