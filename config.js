require('dotenv').config();

module.exports = {
  dbName: process.env.DB_NAME,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'any_secret_key',
  mongoUri: process.env.MONGO_URI,
  port: process.env.PORT || 3000,
};