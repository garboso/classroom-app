const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
	title: {
		type: String,
		required: 'Title is required.'
	},
	content: {
		type: String,
		required: 'Content is required.'
	},
	resourceUrl: {
		type: String
	}
});

module.exports = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);