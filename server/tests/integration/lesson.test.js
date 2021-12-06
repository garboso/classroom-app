const axios = require('axios');
const chai = require('chai');
chai.use(require('chai-subset'));
const faker = require('faker');
const db = require('../../db/config');
const expect = chai.expect;
const request = require('request')
const { initializeWebServer, stopWebServer } = require('../../express');
const { createUser, createCourse, createLesson, authHeader } = require('./util');

let axiosAPIClient;

describe('Lesson routes', () => {
  let educatorId;
  let courseId;

  before(async () => {
    await initializeWebServer();
    await db.setUp('test');

    const axiosConfig = {
      baseURL: `http://localhost:3000`,
      validateStatus: () => true
    };

    axiosAPIClient = axios.create(axiosConfig);
  });

  beforeEach(async () => {
    const email = faker.internet.email();
    const password = faker.internet.password(16);

    await createUser({ email, password, educator: true });

    const signInResponse =
    await axiosAPIClient.post('/signin', { email, password });

    authToken = signInResponse.data.token;
    educatorId = signInResponse.data.user._id;

    const course = await createCourse({ educatorId, authToken });

    courseId = course.data._id;
  });

  afterEach(async () => {
    await db.dropCollections();
  });

  after(async () => {
    await stopWebServer();
    await db.closeConnection();
  });

  describe('POST /course/:courseId/lesson/new', () => {
    it('when add first lesson to the course, then should get a success response', async () => {
      const createLessonResponse = await createLesson({ courseId, authToken });

      expect(createLessonResponse).to.containSubset({
        status: 200,
        data: {
          message: 'Lesson created successfully.'
        }
      });
    });

    it('when add five lessons to a course, then should get a course with five lessons', async () => {
      for (let i = 0; i < 5; i++) {
        await createLesson({ courseId, authToken });
      }

      const getCourseResponse = await axiosAPIClient.get(`/api/course/${courseId}`);

      expect(getCourseResponse.data.lessons).to.exist;
      expect(getCourseResponse.data.lessons.length).to.equal(5);
    });

    it('when add a lesson without sign in, then should get an authentication error', async () => {
      const createLessonResponse = await createLesson({ courseId, authToken: null });

      expect(createLessonResponse).to.containSubset({
        data: {
          error: 'Please sign-in.'
        }
      });
    });

    it('when add a lesson to a course with an user that don\'t created the course, then should get an unauthorized error',
      async () => {
        const email = faker.internet.email();
        const password = faker.internet.password(16);

        await createUser({ email, password, educator: true });

        const signInResponse =
          await axiosAPIClient.post('/signin', { email, password });

        const createLessonResponse =
          await createLesson({ courseId, authToken: signInResponse.data.token });

        expect(createLessonResponse).to.containSubset({
          status: 403,
          data: {
            error: 'User is not authorized.'
          }
        })
      }
    );
  });
});