const config = require('../config');
const db = require('./db/config');
const { initializeWebServer } = require('./express');
const axios = require('axios');

async function start() {
  await db.setUp();
  await initializeWebServer();
}

start().then(() => {
  console.log('The app has started successfully.');
})
.catch((error) => {
  console.log('App occured during startup:', error);
});;