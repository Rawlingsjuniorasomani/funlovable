const BehaviourModel = require('../models/BehaviourModel');

class BehaviourService {
    static async createRecord(data) {
        return await BehaviourModel.create(data);
    }

    static async getStudentRecords(studentId, filters) {
        return await BehaviourModel.getStudentRecords(studentId, filters);
    }

    static async getSummary(studentId) {
        return await BehaviourModel.getSummary(studentId);
    }
}

module.exports = BehaviourService;
