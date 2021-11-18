const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const userRoutes = require('./routes/user');
const config = require('../config');
let app;

let httpServer;

const initializeWebServer = () => {
  return new Promise((resolve, reject) => {
    app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(compress());
    app.use(helmet());
    app.use(cors());

    app.use('/', userRoutes);

    httpServer = http.createServer(app);

    httpServer.listen(3000, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(app);
    });
  });
};

const stopWebServer = () => {
  return new Promise((resolve, reject) => {
    httpServer.close(() => { resolve(); });
  });
};

module.exports = { initializeWebServer, stopWebServer };