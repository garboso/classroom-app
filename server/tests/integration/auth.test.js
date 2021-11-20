const axios = require('axios');
const chai = require('chai');
chai.use(require('chai-subset'));
const expect = chai.expect;
const faker = require('faker');
const db = require('../../db/config');
const { initializeWebServer, stopWebServer } = require('../../express');

let axiosAPIClient;

describe('Auth routes', () => {
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

  describe('POST /signin', () => {
    it('when user entered correctly his credentials, then should retrieve a token and his info',
      async () => {
        const name = faker.name.findName();
        const email = faker.internet.email();
        const password = faker.internet.password(16);

        const response = await axiosAPIClient.post('/api/user', {
          name,
          email,
          password,
          role: faker.helpers.randomize(['STUDENT', 'EDUCATOR']),
          createdAt: faker.date.past(),
          updatedAt: faker.date.soon()
        });

        const signInResponse =
          await axiosAPIClient.post('/signin', { email, password });

        let hasCookieToken = false;

        signInResponse.headers['set-cookie'].forEach((cookieString) => {
          if (cookieString === `t=${signInResponse.data.token}; Path=/`) {
            hasCookieToken = true;
          }
        });

        expect(signInResponse.status).to.equal(200);
        expect(signInResponse.data.token).to.be.a('string');
        expect(hasCookieToken).to.be.true;
        expect(signInResponse.data.user).to.be.deep.equal({
          _id: response.data._id,
          name,
          email
        });
      }
    )
    it('when user entered an invalid password, then should return an unauthorized code and error message',
      async () => {
        const email = faker.internet.email();

        await axiosAPIClient.post('/api/user', {
          email,
          password: faker.internet.password(16),
          name: faker.name.findName(),
          role: faker.helpers.randomize(['STUDENT', 'EDUCATOR']),
          createdAt: faker.date.past(),
          updatedAt: faker.date.soon()
        });

        const signInResponse =
          await axiosAPIClient.post('/signin', {
            email,
            password: faker.internet.password()
          });

        expect(signInResponse).to.containSubset({
          status: 401,
          data: { error: 'Email and password don\'t match.'}
        });
      }
    );
    it('when user entered an invalid email, then should return an unauthorized code and error message',
      async () => {
        const signInResponse =
          await axiosAPIClient.post('/signin', {
            email: faker.internet.email(),
            password: faker.internet.password()
          });

        expect(signInResponse).to.containSubset({
          status: 401,
          data: {
            error: 'User not found.'
          }
        });
      }
    );
  });

  describe('GET /signout', () => {
    it('when user signs out, then should delete jwt token cookie and return success code', 
      async () => {
        const email = faker.internet.email();
        const password = faker.internet.password(16);

        await axiosAPIClient.post('/api/user', {
          email,
          password,
          name: faker.name.findName(),
          role: faker.helpers.randomize(['STUDENT', 'EDUCATOR']),
          createdAt: faker.date.past(),
          updatedAt: faker.date.soon()
        });

        const signInResponse =
          await axiosAPIClient.post('/signin', { email, password });

        const signOutResponse =
          await axiosAPIClient.get('/signout');

        let hasCookieToken = false;

        signOutResponse.headers['set-cookie'].forEach((cookieString) => {
          if (cookieString === `t=${signInResponse.data.token}; Path=/`) {
            hasCookieToken = true;
          }
        });

        expect(signOutResponse.status).to.be.equal(200);
        expect(hasCookieToken).to.be.false;
      }
    );
  });
});