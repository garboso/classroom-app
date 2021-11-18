const mongoose = require('mongoose');
const config = require('../../config');

module.exports.setUp = async (environment) => {
  await mongoose.connect(
    `${config.mongoUri + config.dbName + (environment || '')}`,
    { useNewUrlParser: true });
}

module.exports.closeConnection = async () => {
  await mongoose.connection.close();
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