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
      educator: false
    };

    const newStudent = new User(studentData);
    newStudent.password = studentData.password;

    savedStudent = await newStudent.save();

    expect(savedStudent._id).to.exist;
    expect(savedStudent.name).to.equal(studentData.name);
    expect(savedStudent.email).to.equal(studentData.email);
    expect(savedStudent.salt).to.exist;
    expect(savedStudent.educator).to.equal(studentData.educator);
  });

  it('should create a new Educator user', async () => {
    const educatorData = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      educator: true
    };

    const newEducator = new User(educatorData);
    newEducator.password = educatorData.password;

    const savedEducator = await newEducator.save();

    expect(savedEducator._id).to.exist;
    expect(savedEducator.name).to.equal(educatorData.name);
    expect(savedEducator.email).to.equal(educatorData.email);
    expect(savedEducator.salt).to.exist;
    expect(savedEducator.educator).to.equal(educatorData.educator);
  });

  it('should create a new User only with fields defined in schema', async () => {
    const educatorData = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      educator: faker.helpers.randomize([false, true]),
      phone: '22454231',
    };

    const newEducator = new User(educatorData);
    newEducator.password = educatorData.password;

    const savedEducator = await newEducator.save();

    expect(savedEducator._id).to.exist;
    expect(savedEducator.phone).to.be.undefined;
  })

  it('should throw an exception if educator is invalid', async () => {
    const userData = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      educator: 'Director'
    };

    const newUser = new User(userData);
    newUser.password = userData.password;

    let exception;

    try {
      await newUser.save();
    } catch (exc) {
      exception = exc;
    }

    expect(exception).to.be.an.instanceof(mongoose.Error.ValidationError);
    expect(exception.errors.educator).to.exist;
  });

  it('should throw an exception if email is invalid', async () => {
    const userData = {
      name: faker.name.findName(),
      email: 'invalidemail.com',
      password: faker.internet.password(),
      educator: faker.helpers.randomize([false, true]),
    };

    const newUser = new User(userData);
    newUser.password = userData.password;

    let exception;

    try {
      await newUser.save();
    } catch (exc) {
      exception = exc;
    }

    expect(exception).to.be.an.instanceof(mongoose.Error.ValidationError);
    expect(exception.errors.email).to.exist;
  });

  describe('password checking', () => {
    it('should return true if password is correct', async () => {
      const password = faker.internet.password();

      const userData = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: password,
        educator: faker.helpers.randomize([false, true])
      };

      const newUser = new User(userData);
      newUser.password = userData.password;

      savedUser = await newUser.save();

      expect(savedUser.validatePassword(password)).to.be.true;
    });

    it('should return false if password is wrong', async () => {
      const userData = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        educator: faker.helpers.randomize([false, true])
      };

      const newUser = new User(userData);
      newUser.password = userData.password;

      savedUser = await newUser.save();

      expect(savedUser.validatePassword(faker.internet.password())).to.be.false;
    });

    it('should create a new User only if password has between 12 and 36 characters',
      async () => {
        const userData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: faker.internet.password(faker.datatype.number({ min: 12, max: 36})),
          educator: faker.helpers.randomize([false, true])
        };

        const newUser = new User(userData);
        newUser.password = userData.password;

        savedUser = await newUser.save();

        expect(savedUser._id).to.exist;
        expect(savedUser.salt).to.exist;
        expect(savedUser.validatePassword(userData.password)).to.be.true;
      }
    );

    it('should throw an exception if password has less than 12 characters',
      async () => {
        const userMinData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: faker.internet.password(faker.datatype.number({ min: 1, max: 11})),
          educator: faker.helpers.randomize([false, true])
        };

        const newUserMin = new User(userMinData);

        newUserMin.password = userMinData.password;

        let exception;

        try {
          await newUserMin.save();
        } catch (exc) {
          exception = exc;
        }

        expect(exception).to.be.an.instanceof(mongoose.Error.ValidationError);
        expect(exception.errors.password).to.exist;
      }
    );

    it('should throw an exception if password has more than 36 characters',
      async () => {
        const userMaxData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: faker.internet.password(faker.datatype.number({ min: 37, max: 48})),
          educator: faker.helpers.randomize([false, true])
        };

        const newUserMax = new User(userMaxData);

        newUserMax.password = userMaxData.password;

        let exception;

        try {
          const save = await newUserMax.save();
          console.log(save);
        } catch (exc) {
          exception = exc;
        }

        expect(exception).to.be.an.instanceof(mongoose.Error.ValidationError);
        expect(exception.errors.password).to.exist;
      }
    );

    it('should throw an exception if password is null',
      async () => {
        const newUserMax = new User({
          name: faker.name.findName(),
          email: faker.internet.email(),
          educator: faker.helpers.randomize([false, true])
        });

        let exception;

        try {
          const save = await newUserMax.save();
          console.log(save);
        } catch (exc) {
          exception = exc;
        }

        expect(exception).to.be.an.instanceof(mongoose.Error.ValidationError);
        expect(exception.errors.hash).to.exist;
      }
    );
  });
});