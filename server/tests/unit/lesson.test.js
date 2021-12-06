const { expect } = require('chai');
const faker = require('faker');
const mongoose = require('mongoose');
const db = require('../../db/config');
const Lesson = require('../../models/Lesson');

describe('Lesson model', () => {
	before(async () => {
		await db.setUp('test');
	});

	afterEach(async () => {
		await db.dropCollections();
	});

	after(async () => {
		await db.closeConnection();
	});

	it('should create a new lesson', async () => {
		const lessonData = {
			title: faker.lorem.sentence(),
			content: faker.lorem.paragraphs(3),
			resourceUrl: faker.internet.url()
		};

		const lesson = new Lesson(lessonData);
		const savedLesson = await lesson.save();

		expect(savedLesson._id).to.exist;
		expect(savedLesson.title).to.equal(lessonData.title);
		expect(savedLesson.content).to.equal(lessonData.content);
		expect(savedLesson.resourceUrl).to.equal(lessonData.resourceUrl);
	});

	it('should throw an error if lesson don\'t have a title or content', async () => {
		let exception;

		try {
			await new Lesson().save();
		} catch (exc) {
			exception = exc;
		}

		expect(exception).to.be.an.instanceof(mongoose.Error.ValidationError);
		expect(exception.errors.title).to.exist;
		expect(exception.errors.content).to.exist;
	});
});