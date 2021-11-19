const axios = require('axios');
const chai = require('chai');
chai.use(require('chai-subset'));
const faker = require('faker');
const db = require('../../db/config');
const bson = require('bson');
const expect = chai.expect;
const { initializeWebServer, stopWebServer } = require('../../express');
let axiosAPIClient;
const PASSWORD_LENGTH = 16;

describe('User routes', () => {
  before(async () => {
    await initializeWebServer();
    await db.setUp('test');

    const axiosConfig = {
      baseURL: `http://localhost:3000`,
      validateStatus: () => true
    };

    axiosAPIClient = axios.create(axiosConfig);
  });

  afterEach(async () => {
    await db.dropCollections();
  });

  after(async () => {
    await stopWebServer();
    await db.closeConnection();
  });

  describe('GET /api/users', () => {
    it('when asked for all users, then should retrieve an array and 200 response',
      async () => {
        const numberOfUsers = faker.datatype.number({ max: 10 });

        for (let i = 1; i <= numberOfUsers; i++) {
          await axiosAPIClient.post('/api/user', {
            name: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password(PASSWORD_LENGTH),
            role: faker.helpers.randomize(['STUDENT', 'EDUCATOR']),
            createdAt: faker.date.past(),
            updatedAt: faker.date.soon()
          });
        }

        const response = await axiosAPIClient.get('/api/users');

        expect(response.data).to.be.an('array');
        expect(response.data).to.have.lengthOf(numberOfUsers);
        expect(response.status).to.be.equal(200);
      }
    );
  });

  describe('GET /api/user/:id', () => {
    it('when asked for an existent user, then should retrieve it and receive 200 response',
      async () => {
        const userData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: faker.internet.password(PASSWORD_LENGTH),
          role: faker.helpers.randomize(['STUDENT', 'EDUCATOR']),
          createdAt: faker.date.past().toISOString(),
          updatedAt: faker.date.soon().toISOString()
        };

        const postResponse = await axiosAPIClient.post('/api/user', userData);
        const getResponse = await axiosAPIClient.get(`/api/user/${postResponse.data._id}`);

        expect(getResponse).to.containSubset({
          status: 200,
          data: {
            name: userData.name,
            email: userData.email,
            role: userData.role,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
          }
        });
      }
    );

    it('when asked for an inexistent user, then should receive 404 response',
      async () => {
        const response = await axiosAPIClient.get(`/api/user/${bson.ObjectId()}`);

        expect(response.status).to.equal(404);
      }
    );
  });

  describe('POST /api/user', () => {
    it('when add a new user, then should get back approval with 200 response',
      async () => {
        const userData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: faker.internet.password(PASSWORD_LENGTH),
          role: faker.helpers.randomize(['STUDENT', 'EDUCATOR']),
          createdAt: faker.date.past(),
          updatedAt: faker.date.soon()
        };

        const response = await axiosAPIClient.post('/api/user', userData);

        expect(response).to.containSubset({
          status: 200,
          data: { message: 'User signed up.' }
        });
      }
    );

    it('when try to add new user with an existent email address, then should receive 400 response',
      async () => {
        const userData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: faker.internet.password(PASSWORD_LENGTH),
          role: faker.helpers.randomize(['STUDENT', 'EDUCATOR']),
          createdAt: faker.date.past(),
          updatedAt: faker.date.soon()
        };

        await axiosAPIClient.post('/api/user', userData);

        const response = await axiosAPIClient.post('/api/user', userData);

        expect(response.status).to.equal(400);
      }
    );
  });

  describe('PUT /api/user/:id', () => {
    it('when edit an existent user data, then should receive approval with 200 response',
      async () => {
        const userData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: faker.internet.password(PASSWORD_LENGTH),
          role: faker.helpers.randomize(['STUDENT', 'EDUCATOR']),
          createdAt: faker.date.past().toISOString(),
          updatedAt: faker.date.soon().toISOString()
        };

        const [firstName, lastName] = userData.name.split('');

        const postResponse = await axiosAPIClient.post('/api/user', userData);

        const putResponse = await axiosAPIClient.put(
          `/api/user/${postResponse.data._id}`, {
            email: faker.internet.email(firstName, lastName)
          });

        expect(putResponse).to.containSubset({
          status: 200,
          data: { message: 'User data successfully updated.' }
        });
      }
    );

    it('when edit an existent user, then should be able to check new state',
      async () => {
        const userData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: faker.internet.password(PASSWORD_LENGTH),
          role: 'STUDENT',
          createdAt: faker.date.past().toISOString(),
          updatedAt: faker.date.soon().toISOString()
        };

        const postResponse = await axiosAPIClient.post('/api/user', userData);
        const userId = postResponse.data._id;

        const putResponse = await axiosAPIClient.put(
          `/api/user/${userId}`, {
            role: 'EDUCATOR'
          });

        const getResponse = await axiosAPIClient.get(`/api/user/${userId}`);

        expect(getResponse).to.containSubset({
          status: 200,
          data: { role: 'EDUCATOR' }
        });
      }
    );

    it('when try to edit an inexistent user, then should receive 404 response',
      async () => {
        const response = await axiosAPIClient.put(
          `/api/user/${bson.ObjectId()}`, {
            role: faker.helpers.randomize(['STUDENT', 'EDUCATOR'])
          });

        expect(response.status).to.equal(404);
      }
    );
  });

  describe('DELETE /api/user/:id', () => {
    it('when delete an existent user, then should receive approval with 200 response',
      async () => {
        const userData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: faker.internet.password(PASSWORD_LENGTH),
          role: faker.helpers.randomize(['STUDENT', 'EDUCATOR']),
          createdAt: faker.date.past().toISOString(),
          updatedAt: faker.date.soon().toISOString()
        };

        const postResponse =
          await axiosAPIClient.post('/api/user', userData);
        const deleteResponse =
          await axiosAPIClient.delete(`/api/user/${postResponse.data._id}`);

        expect(deleteResponse).to.containSubset({
          status: 200,
          data: { message: 'User deleted successfully.'}
        });
      }
    );

    it('when delete an existent user, then shouldn\'t able to retrieve it',
      async () => {
        const userData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: faker.internet.password(PASSWORD_LENGTH),
          role: faker.helpers.randomize(['STUDENT', 'EDUCATOR']),
          createdAt: faker.date.past().toISOString(),
          updatedAt: faker.date.soon().toISOString()
        };

        const postResponse =
          await axiosAPIClient.post('/api/user', userData);

        await axiosAPIClient.delete(`/api/user/${postResponse.data._id}`);

        const getResponse = await axiosAPIClient.get(`/api/user/${postResponse.data._id}`);

        expect(getResponse.status).to.equal(404);
      }
    );

    it.skip('when try to delete another user which isn\'t himself, then should receive 304 response');
  });
});