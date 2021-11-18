const { expect } = require('chai');
const faker = require('faker');
const mongoose = require('mongoose');
const db = require('../../db/config');
const User = require('../../models/User');

describe("User model", () => {
  before(async () => {
    await db.setUp('test');
  });

  afterEach(async () => {
    await db.dropCollections();
  });

  after(async () => {
    await db.closeConnection();
  });

  it('should create a new Student user', async () => {
    const studentData = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'STUDENT'
    };

    const newStudent = new User(studentData);
    newStudent.setPassword(studentData.password);

    savedStudent = await newStudent.save();

    expect(savedStudent._id).to.exist;
    expect(savedStudent.name).to.equal(studentData.name);
    expect(savedStudent.email).to.equal(studentData.email);
    expect(savedStudent.salt).to.exist;
    expect(savedStudent.role).to.equal(studentData.role);
  });

  it('should create a new Educator user', async () => {
    const educatorData = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'EDUCATOR'
    };

    const newEducator = new User(educatorData);
    newEducator.setPassword(educatorData.password);

    const savedEducator = await newEducator.save();

    expect(savedEducator._id).to.exist;
    expect(savedEducator.name).to.equal(educatorData.name);
    expect(savedEducator.email).to.equal(educatorData.email);
    expect(savedEducator.salt).to.exist;
    expect(savedEducator.role).to.equal(educatorData.role);
  });

  it('should create a new User only with fields defined in schema', async () => {
    const educatorData = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: faker.helpers.randomize(['STUDENT', 'EDUCATOR']),
      phone: '22454231',
    };

    const newEducator = new User(educatorData);
    newEducator.setPassword(educatorData.password);

    const savedEducator = await newEducator.save();

    expect(savedEducator._id).to.exist;
    expect(savedEducator.phone).to.be.undefined;
  })

  it('should throw an exception if role is invalid', async () => {
    const userData = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'Director'
    };

    const newUser = new User(userData);
    newUser.setPassword(userData.password);

    let exception;

    try {
      await newUser.save();
    } catch (exc) {
      exception = exc;
    }

    expect(exception).to.be.an.instanceof(mongoose.Error.ValidationError);
    expect(exception.errors.role).to.exist;
  });

  it('should throw an exception if email is invalid', async () => {
    const userData = {
      name: faker.name.findName(),
      email: 'invalidemail.com',
      password: faker.internet.password(),
      role: faker.helpers.randomize(['STUDENT', 'EDUCATOR']),
    };

    const newUser = new User(userData);
    newUser.setPassword(userData.password);

    let exception;

    try {
      await newUser.save();
    } catch (exc) {
      exception = exc;
    }

    expect(exception).to.be.an.instanceof(mongoose.Error.ValidationError);
    expect(exception.errors.email).to.exist;
  });
});
