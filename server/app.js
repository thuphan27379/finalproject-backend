// server.js
const express = require('express');
require('dotenv').config();
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const { sendResponse, AppError } = require('./src/helpers/utils');
const indexRouter = require('./src/routes/index');

// server
const app = express();
console.log(process.env.PORT);

app.listen(process.env.PORT);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
// app.use(
//   cors({
//     origin: 'http://localhost:9000', // Allow frontend origin
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   })
// );
app.use(express.static(path.join(__dirname, 'public'))); // static folder

// APIs connect
app.use('/api', indexRouter); // => router.get()

// connect mongoose
const mongoURI = process.env.MONGODB_URI;
console.log(mongoURI);
mongoose
  .connect(mongoURI)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log(err));

// error handlers
// catch 404
app.use((req, res, next) => {
  const err = new Error('Not found');
  err.statusCode = 404;
  next(err);
});

// 500
app.use((err, req, res, next) => {
  console.log('Error', err);
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
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    return sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      { message: err.message },
      'internal server error'
    );
  }
});

// Catch-all route handler for all client-side routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

module.exports = app;
