const LessonModel = require('../models/LessonModel');

class LessonService {
    static async getLessonsByModule(moduleId) {
        return await LessonModel.findAllByModuleId(moduleId);
    }
    static async getLessonById(id) {
        const lesson = await LessonModel.findById(id);
        if (!lesson) throw new Error('Lesson not found');
        return lesson;
    }

    static async createLesson(data) {
        return await LessonModel.create(data);
    }
    static async updateLesson(id, data) {
        const lesson = await LessonModel.update(id, data);
        if (!lesson) throw new Error('Lesson not found');
        return lesson;
    }

    static async deleteLesson(id) {
        const lesson = await LessonModel.delete(id);
        if (!lesson) throw new Error('Lesson not found');
        return { message: 'Lesson deleted' };
    }
}

module.exports = LessonService;
