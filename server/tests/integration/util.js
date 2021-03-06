const faker = require('faker');
const axios = require('axios');
const request = require('request');

const createUser = async({
  name = faker.name.findName(),
  email = faker.internet.email(),
  password = faker.internet.password(16),
  educator = faker.helpers.randomize([false, true]),
  createdAt = faker.date.past().toISOString(),
  updatedAt = faker.date.soon().toISOString()} = {}) => {

  const axiosAPIClient = axios.create({
    baseURL: `http://localhost:3000`,
    validateStatus: () => true
  });

  return await axiosAPIClient.post('/api/user', {
    name, email, password, educator, createdAt, updatedAt
  });
}

const createCourse = async({
  name = faker.lorem.words(2),
  description = faker.lorem.sentences(4),
  category = faker.commerce.department(),
  published = false,
  image = getRandomImageBuffer(512, 512),
  createdAt = faker.date.past().toISOString(),
  educatorId,
  authToken,
} = {}) => {

  const axiosAPIClient = axios.create({
    baseURL: `http://localhost:3000`,
    validateStatus: () => true
  });

  return await axiosAPIClient.post(`/api/course/by/${educatorId}`, {
    name, description, category, published, image, createdAt
  }, authHeader(authToken));
}

const authHeader = (token) => {
  return { headers: { Authorization: `Bearer ${token}` }};
}

const getRandomImageBuffer = (width, height) => {
  request({
    url: faker.image.image(width, height, true),
    method: 'get',
    encoding: null
  },
  (error, response, body) => {
    if (error) console.log(error);
    else {
      return body;
    }
  });
}

module.exports = { createUser, createCourse, authHeader, getRandomImageBuffer }