const GradesModel = require('../models/GradesModel');

class GradesService {
    static async createGrade(data) {
        return await GradesModel.create(data);
    }

    static async getStudentGrades(studentId, filters) {
        return await GradesModel.getStudentGrades(studentId, filters);
    }

    static async updateGrade(id, data) {
        return await GradesModel.update(id, data);
    }

    static async deleteGrade(id) {
        return await GradesModel.delete(id);
    }

    static async generateReportCard(data) {
        return await GradesModel.generateReportCard(data);
    }

    static async getReportCard(studentId, term, academicYear) {
        return await GradesModel.getReportCard(studentId, term, academicYear);
    }

    static async publishReportCard(id) {
        return await GradesModel.publishReportCard(id);
    }
}

module.exports = GradesService;
