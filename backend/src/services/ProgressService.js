const ProgressModel = require('../models/ProgressModel');

class ProgressService {
    static async trackLessonView(data) {
        return await ProgressModel.trackLessonView(data);
    }

    static async getStudentProgress(studentId, filters) {
        return await ProgressModel.getStudentProgress(studentId, filters);
    }

    static async updateAnalytics(data) {
        return await ProgressModel.updateAnalytics(data);
    }

    static async getAnalytics(studentId, subjectId) {
        return await ProgressModel.getAnalytics(studentId, subjectId);
    }
}

module.exports = ProgressService;
