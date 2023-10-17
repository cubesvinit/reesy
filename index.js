const express = require("express");
const app = express();
const db = require("./config/db.config.js");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

const port = 8000;
app.get("/", function (req, res) {
  res.send("Welcome to Reesy App");
});

const usersRoutes = require("./routes/user.route.js");
app.use("/", usersRoutes);


app.listen(port, function (error) {
  if (error) throw error;
  console.log(`Server created Successfully on port ${port}`);
});
