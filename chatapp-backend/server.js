const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// const logger = require("morgan");

const app = express();
app.use(cors());

const dbConfig = require("/home/devi/git/chatapp-backend/config/secret.js");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "false");
  res.header(
    "Access-Control-Allow-Methods",
    "GET",
    "POST",
    "DELETE",
    "PUT",
    "OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );
  next();
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
// app.use(logger("dev"));

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const auth = require("/home/devi/git/chatapp-backend/routes/authRoutes.js");
app.use("/api/chatapp", auth);
app.listen(3000, () => {
  console.log("Running on port 3000");
});
