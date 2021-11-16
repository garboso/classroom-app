const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const userRoutes = require('./routes/user');

const CURRENT_WORKING_DIR = process.cwd();
const app = require('express')();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(helmet());
app.use(cors());

app.use('/', userRoutes);
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({"error": `${err.name}: ${err.message}`});
  } else if (err) {
    res.status(400).json({"error": `${err.name}: ${err.message}`});
    console.log(err);
  }
});

module.exports = app;