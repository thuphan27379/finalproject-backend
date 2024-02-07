const express = require("express");
require("dotenv").config(); //
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors"); //
const mongoose = require("mongoose");

const { sendResponse, AppError } = require("./src/helpers/utils");
const indexRouter = require("./src/routes/index");

//
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors()); //
app.use(express.static(path.join(__dirname, "public")));

// API
app.use("/api", indexRouter); //

// connect mongoose
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err)); //

// error handlers
// catch 404
app.use((req, res, next) => {
  const err = new Error("Not found");
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log("Error", err);
  if (err) {
    // isOperational
    return sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      { message: err.message },
      err.errorType
    );
  } else {
    return sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      { message: err.message },
      "internal server error"
    );
  }
});

module.exports = app;
