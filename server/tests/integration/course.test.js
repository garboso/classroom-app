const axios = require('axios');
const chai = require('chai');
chai.use(require('chai-subset'));
const faker = require('faker');
const db = require('../../db/config');
const expect = chai.expect;
const request = require('request')
const { initializeWebServer, stopWebServer } = require('../../express');
const { createUser, createCourse, authHeader, getRandomImageBuffer } = require('./util');

let axiosAPIClient;

describe('Course routes', () => {
  before(async () => {
    await initializeWebServer();
    await db.setUp('test');

    const axiosConfig = {
      baseURL: `http://localhost:3000`,
      validateStatus: () => true
    };

    axiosAPIClient = axios.create(axiosConfig);
  });

  let educatorId;

  beforeEach(async () => {
    const email = faker.internet.email();
    const password = faker.internet.password(16);

    await createUser({ email, password, educator: true });

    const signInResponse =
    await axiosAPIClient.post('/signin', { email, password });

    authToken = signInResponse.data.token;
    educatorId = signInResponse.data.user._id;
  });

  afterEach(async () => {
    await db.dropCollections();
  });

  after(async () => {
    await stopWebServer();
    await db.closeConnection();
  });

  describe('POST /api/course/by/:userId', () => {
    it('when add a new course, then should get a 200 response', async () => {
      const newCourse = await createCourse({ educatorId, authToken });

      expect(newCourse).to.containSubset({
        status: 200,
        data: {
          message: 'Course successfully created.'
        }
      });
    });

    // it('when try to add a new course passing another educatorId on URL, then should throw an error',
    //   async () => {
    //     const newUser = await createUser();

    //     const courseWithBogusId = await createCourse({ educatorId: 1, authToken });
    //     const courseWithRealUserId = await createCourse({ educatorId: newUser.data._id, authToken });

    //     expect(courseWithBogusId).to.containSubset({
    //       status: 400,
    //       data: { error: 'Could not retrieve user.'}
    //     });

    //     expect(courseWithRealUserId).to.containSubset({
    //       status: 403,
    //       data: { error: 'User is not authorized.'}
    //     });
    //   }
    //   );

    // it('when add a new course before sign in, then should get a 401 response', async () => {
    //   const newCourse = await createCourse({ educatorId });

    //   expect(newCourse).to.containSubset({
    //     status: 401,
    //     data: {
    //       error: 'Please sign-in.'
    //     }
    //   });
    // });

    // it('when add a new course with a student user, then should get a 401 response', async () => {
    //   const email = faker.internet.email();
    //   const password = faker.internet.password(16);

    //   await createUser({ email, password, educator: false })

    //   const studentLoginResponse = await axiosAPIClient.post('/signin', { email, password });
    //   const studentId = studentLoginResponse.data.user._id;

    //   const newCourse = await createCourse({
    //     educatorId: studentId,
    //     authToken: studentLoginResponse.data.token }
    //     );

    //   expect(newCourse).to.containSubset({
    //     status: 403,
    //     data: {
    //       error: 'User is not an educator.'
    //     }
    //   });
    // });
  });

  describe('GET /api/courses', () => {
    it('when asked for all courses, then should retrieve an array and 200 response', async () => {
      const numberOfCourses = faker.datatype.number({ max: 10 });

      for (let i = 1; i <= numberOfCourses; i++) {
        await createCourse({ educatorId, authToken });
      }

      const getResponse = await axiosAPIClient.get('/api/courses');

      expect(getResponse.data).to.be.an('array');
      expect(getResponse.data).to.have.lengthOf(numberOfCourses);
      expect(getResponse.status).to.be.equal(200);
    });
  });

  describe('GET /api/courses/by/:userId', () => {
    it('when asked for courses from an specific educator, then should retrieve an array and 200 response', async () => {
      const numberOfCourses = faker.datatype.number({ max: 10 });

      for (let i = 1; i <= numberOfCourses; i++) {
        await createCourse({ educatorId, authToken })
      }

      const getResponse = await axiosAPIClient.get(
        `/api/courses/by/${educatorId}`,
        authHeader(authToken)
        );

      expect(getResponse.data).to.be.an('array');
      expect(getResponse.data).to.have.lengthOf(numberOfCourses);
      expect(getResponse.status).to.be.equal(200);
    });

    it('when asked for an educator that don\'t have courses, then should retrieve an empty array', async () => {
      const newUser = await createUser({ educator: true });

      const getResponse = await axiosAPIClient.get(
        `/api/courses/by/${newUser.data._id}`,
        authHeader(authToken)
        );

      expect(getResponse.data).to.be.an('array');
      expect(getResponse.data).to.have.lengthOf(0);
      expect(getResponse.status).to.be.equal(200);
    });
  });

  describe('GET /api/course/:courseId', () => {
    it('when asked for a specific course, then should retrieve course info and 200 response',
      async () => {
        const courseData = {
          name: faker.lorem.words(2),
          description: faker.lorem.sentences(4),
          category: faker.commerce.department(),
          published: false,
          image: getRandomImageBuffer(512, 512),
          createdAt: faker.date.past().toISOString()
        };

        const newCourse = await createCourse({
          name: courseData.name,
          description: courseData.description,
          category: courseData.category,
          published: courseData.published,
          image: courseData.image,
          createdAt: courseData.createdAt,
          educatorId,
          authToken
        });

        const getResponse =
        await axiosAPIClient.get(`/api/course/${newCourse.data._id}`);

        expect(getResponse).to.containSubset({
          data: courseData,
          status: 200
        });
      }
      );
  });

  describe('PUT /api/course/:courseId/by/:userId', () => {
    it('when change published state to true, then return a 200 response', async () => {
      const course = await createCourse({ educatorId, authToken });

      const putResponse =
      await axiosAPIClient.put(`/api/course/${course.data._id}/by/${educatorId}`, {
        published: true
      },
      authHeader(authToken)
      );

      expect(putResponse).to.containSubset({
        status: 200,
        data: { message: 'Course data successfully updated.' }
      });
    });

    it('when change a course created by another educator, then return an error', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password(16);

      const newEducator = await createUser({ email, password, educator: true });
      const signInNewUser = await axiosAPIClient.post('/signin', { email, password });

      const newCourse = await createCourse({
        educatorId: newEducator.data._id,
        authToken: signInNewUser.data.token });

      const changeWithBogusId =
      await axiosAPIClient.put(`/api/course/${newCourse.data._id}/by/1`, {
        published: true
      },
      authHeader(authToken)
      );

      const changeWithRealId =
      await axiosAPIClient.put(`/api/course/${newCourse.data._id}/by/${educatorId}`, {
        published: true
      },
      authHeader(authToken)
      );

      expect(changeWithBogusId).to.containSubset({
        status: 400,
        data: {
          error: 'Could not retrieve user.'
        }
      })

      expect(changeWithRealId).to.containSubset({
        status: 403,
        data: {
          error: 'User is not authorized.'
        }
      });
    });
  });

  describe('DELETE /api/course/:courseId/by/:userId', () => {
    it('when delete a course, then return 200 response', async () => {
      const course = await createCourse({ educatorId, authToken });

      const deleteCourseResponse =
      await axiosAPIClient.delete(
        `/api/course/${course.data._id}/by/${educatorId}`,
        authHeader(authToken)
        );

      expect(deleteCourseResponse).to.containSubset({
        status: 200,
        data: {
          message: 'Course deleted successfully.'
        }
      });
    });

    it('when delete an inexistent course, then return an error', async () => {
      const deleteCourseResponse =
      await axiosAPIClient.delete(
        `/api/course/1/by/${educatorId}`,
        authHeader(authToken)
        );

      expect(deleteCourseResponse).to.containSubset({
        status: 400,
        data: {
          error: 'Could not retrieve course.'
        }
      });
    });

    it('when delete a course created by another educator, then return an unauthorized error', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password(16);
      const newEducator = await createUser({ email, password, educator: true });

      const newEducatorSignIn = await axiosAPIClient.post('/signin', { email, password });

      const course = await createCourse({
        educatorId: newEducator.data._id, authToken: newEducatorSignIn.data.token
      });

      const deleteResponse = await axiosAPIClient.delete(
        `/api/course/${course.data._id}/by/${educatorId}`,
        authHeader(authToken)
      );

      expect(deleteResponse).to.containSubset({
        status: 403,
        data: {
          error: 'User is not authorized.'
        }
      });
    });
  });
});