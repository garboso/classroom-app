const config = require('../config');
const db = require('./db');
const app = require('./express');

db.setUp();

app.listen(config.port, (err) => {
  if (err) console.log(err);

  console.info(`Server started on port ${config.port}`);
})