const mongoose = require('mongoose');
const config = require('../config.js');

module.exports.setUp = async () => {
  await mongoose.connect(config.mongoUri, { useNewUrlParser: true });
}

module.exports.dropDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}

module.exports.dropCollections = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany();
  }
}