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
const { createUser, authHeader } = require('./util');

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
          await createUser();
        }

        const response = await axiosAPIClient.get('/api/users');

        expect(response.data).to.be.an('array');
        expect(response.data).to.have.lengthOf(numberOfUsers);
        expect(response.status).to.be.equal(200);
      }
      );
  });

  describe('GET /api/user/:userId', () => {
    let authToken, userId, userData;

    beforeEach(async () => {
      const email = faker.internet.email();
      const password = faker.internet.password(PASSWORD_LENGTH);

      userData = {
        name: faker.name.findName(),
        email,
        password,
        educator: faker.helpers.randomize([false, true]),
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.soon().toISOString()
      };

      const postResponse =
        await createUser({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          educator: userData.educator,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        });

      const signInResponse =
        await axiosAPIClient.post('/signin', { email, password });

      authToken = signInResponse.data.token;
      userId = postResponse.data._id;
    });

    afterEach(async () => {
      await axiosAPIClient.get('/signout');
    });

    it('when asked for an existent user, then should retrieve it and receive 200 response',
      async () => {
        const getResponse =
          await axiosAPIClient.get(
            `/api/user/${userId}`,
            authHeader(authToken)
          );

        expect(getResponse).to.containSubset({
          status: 200,
          data: {
            name: userData.name,
            email: userData.email,
            educator: userData.educator,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
          }
        });
      });

    it('when asked for an inexistent user, then should receive 400 response',
      async () => {
        const response =
          await axiosAPIClient.get(
            `/api/user/${bson.ObjectId()}`,
            authHeader(authToken)
          );

        expect(response.status).to.equal(400);
      }
    );

    it('when asked for an user before sign in, then should receive 401 response',
      async () => {
        const response = await axiosAPIClient.get(`/api/user/${userId}`);

        expect(response).to.containSubset({
          status: 401,
          data: {
            error: 'Please sign-in.'
          }
        });
      }
    );
  });

  describe('POST /api/user', () => {
    it('when add a new user, then should get back approval with 200 response',
      async () => {
        const response = await createUser();

        expect(response).to.containSubset({
          status: 200,
          data: { message: 'User signed up.' }
        });
      }
    );

    it('when try to add new user with an existent email address, then should receive 400 response',
      async () => {
        const email = faker.internet.email();

        await createUser({ email });

        const response = await createUser({ email });

        expect(response.status).to.equal(400);
      }
    );
  });

  describe('PUT /api/user/:userId', () => {
    let authToken;
    let currentUserId;

    beforeEach(async () => {
      const email = faker.internet.email();
      const password = faker.internet.password(PASSWORD_LENGTH);

      const postResponse =
        await createUser({ email, password });

      const signInResponse =
        await axiosAPIClient.post('/signin', { email, password });

      authToken = signInResponse.data.token;
      currentUserId = signInResponse.data.user._id;
    });

    afterEach(async () => {
      await axiosAPIClient.get('/signout');
    });

    it('when edit an existent user data, then should receive approval with 200 response',
      async () => {
        const putResponse =
          await axiosAPIClient.put(
            `/api/user/${currentUserId}`,
            { email: faker.internet.email() },
            authHeader(authToken),
          );

        expect(putResponse).to.containSubset({
          status: 200,
          data: { message: 'User data successfully updated.' }
        });
      }
    );

    it('when edit an existent user, then should be able to check new state',
      async () => {
        const newEducator = true;

        const putResponse =
          await axiosAPIClient.put(
            `/api/user/${currentUserId}`,
            { educator: newEducator },
            authHeader(authToken),
          );

        const getResponse =
          await axiosAPIClient.get(
            `/api/user/${currentUserId}`,
            authHeader(authToken)
          );

        expect(getResponse).to.containSubset({
          status: 200,
          data: { educator: true }
        });
      }
    );

    it('when try to edit another user, then should receive 403 response',
      async () => {
        const newUserPostResponse = await createUser();

        const putResponse =
          await axiosAPIClient.put(
            `/api/user/${newUserPostResponse.data._id}`,
            { name: 'Bogus Bogus' },
            authHeader(authToken)
          );

        expect(putResponse).to.containSubset({
          status: 403,
          data: {
            error: 'User is not authorized.'
          }
        });
      }
    );
  });

  describe('DELETE /api/user/:userId', () => {
    let someUserId, authToken;
    const someUserEmail = faker.internet.email();
    const someUserPassword = faker.internet.password(PASSWORD_LENGTH);

    beforeEach(async () => {
      const postResponse =
        await createUser({ email: someUserEmail, password: someUserPassword });

      const signInResponse =
        await axiosAPIClient.post(
          '/signin',
          { email: someUserEmail, password: someUserPassword }
        );

      someUserId = postResponse.data._id;
      authToken = signInResponse.data.token;
    });

    afterEach(async () => {
      await axiosAPIClient.get('/signout');
    });

    it('when delete an existent user, then should receive approval with 200 response',
      async () => {
        const deleteResponse =
          await axiosAPIClient.delete(
            `/api/user/${someUserId}`,
            authHeader(authToken)
          );

        expect(deleteResponse).to.containSubset({
          status: 200,
          data: { message: 'User deleted successfully.'}
        });
      }
    );

    it('when delete an existent user, then shouldn\'t able to retrieve it',
      async () => {
        const deletedUserEmail = faker.internet.email();
        const deletedUserPassword = faker.internet.password(PASSWORD_LENGTH);

        const postResponse =
          await createUser({ email: deletedUserEmail, password: deletedUserPassword });

        const signInResponse =
          await axiosAPIClient.post(
            '/signin',
            { email: deletedUserEmail, password: deletedUserPassword }
          );

        const deleteResponse =
          await axiosAPIClient.delete(
            `/api/user/${postResponse.data._id}`,
            authHeader(signInResponse.data.token)
          );

        await axiosAPIClient.get('/signout');

        const someUserSignInResponse =
          await axiosAPIClient.post(
            '/signin',
            { email: someUserEmail, password: someUserPassword }
          );

        const getResponse =
          await axiosAPIClient.get(
            `/api/user/${postResponse.data._id}`,
            authHeader(someUserSignInResponse.data.token)
          );

        expect(getResponse.status).to.equal(400);
      }
    );

    it('when try to delete another user which isn\'t himself, then should receive 304 response',
        async () => {
          const deletedUserEmail = faker.internet.email();
          const deletedUserPassword = faker.internet.password(PASSWORD_LENGTH);

          const postResponse =
            await createUser({ email: deletedUserEmail, password: deletedUserPassword });

          const deleteResponse =
            await axiosAPIClient.delete(
              `/api/user/${postResponse.data._id}`,
              authHeader(authToken)
            );

          expect(deleteResponse).to.containSubset({
            status: 403,
            data: {
              error: 'User is not authorized.'
            }
          });
        }
    );
  });
});