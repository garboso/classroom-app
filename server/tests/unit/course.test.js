const { expect } = require('chai');
const faker = require('faker');
const mongoose = require('mongoose');
const db = require('../../db/config');
const Course = require('../../models/Course');
const User = require('../../models/User');

describe('Course model', () => {
  let educatorId;

  before(async () => {
    await db.setUp('test');
  });

  beforeEach(async () => {
    educatorId = await new User({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      educator: true
    }).save()._id;
  });

  afterEach(async () => {
    await db.dropCollections();
  });

  after(async () => {
    await db.closeConnection();
  });

  it('should create a new Course', async () => {
    const courseName = faker.lorem.words(2);

    const newCourse = new Course({
      name: courseName,
      description: faker.lorem.sentences(4),
      category: faker.commerce.department(),
      instructor: educatorId
    });

    const savedCourse = await newCourse.save();

    expect(savedCourse._id).to.exist;
    expect(savedCourse.name).to.equal(courseName);
    expect(savedCourse.instructor).to.equal(educatorId);
    expect(savedCourse.published).to.equal(false);
  });

  it('should throw an error if Course don\'t have a name or category', async () => {
    let exception;

    try {
      await new Course({
            description: faker.lorem.sentences(4),
            instructor: educatorId
          }).save();
    } catch (exc) {
      exception = exc;
    }

    expect(exception).to.be.an.instanceof(mongoose.Error.ValidationError);
    expect(exception.errors.category).to.exist;
    expect(exception.errors.name).to.exist;
  });
});