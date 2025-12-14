const AttendanceModel = require('../models/AttendanceModel');

class AttendanceService {
    static async markAttendance(data) {
        return await AttendanceModel.markAttendance(data);
    }

    static async bulkMarkAttendance(attendanceRecords) {
        return await AttendanceModel.bulkMarkAttendance(attendanceRecords);
    }

    static async getStudentAttendance(studentId, filters) {
        return await AttendanceModel.getStudentAttendance(studentId, filters);
    }

    static async getClassAttendance(subjectId, date) {
        return await AttendanceModel.getClassAttendance(subjectId, date);
    }

    static async getAttendanceStats(studentId, subjectId) {
        return await AttendanceModel.getAttendanceStats(studentId, subjectId);
    }
}

module.exports = AttendanceService;
