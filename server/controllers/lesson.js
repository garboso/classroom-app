const Lesson = require('../models/Lesson');

const create = async (req, res) => {
	const lesson = new Lesson(req.body);
	req.course.lessons.push(lesson);
	req.course.updatedAt = Date.now();

	try {
		await req.course.save();

    return res.status(200).json({
      message: 'Lesson created successfully.'
    });
	} catch (err) {
		return res.status(400);
	}
};

module.exports = { create };