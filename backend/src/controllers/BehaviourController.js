const BehaviourService = require('../services/BehaviourService');

class BehaviourController {
    static async createRecord(req, res) {
        try {
            const { student_id, type, category, description, severity, action_taken, date } = req.body;

            if (!student_id || !type || !category || !description) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const record = await BehaviourService.createRecord({
                student_id,
                teacher_id: req.user.id,
                type,
                category,
                description,
                severity,
                action_taken,
                date
            });

            res.status(201).json(record);
        } catch (error) {
            console.error('Create behaviour record error:', error);
            res.status(500).json({ error: 'Failed to create behaviour record' });
        }
    }

    static async getStudentRecords(req, res) {
        try {
            const { studentId } = req.params;
            const { type, start_date, end_date } = req.query;

            const records = await BehaviourService.getStudentRecords(studentId, { type, start_date, end_date });
            res.json(records);
        } catch (error) {
            console.error('Get behaviour records error:', error);
            res.status(500).json({ error: 'Failed to fetch behaviour records' });
        }
    }

    static async getSummary(req, res) {
        try {
            const { studentId } = req.params;
            const summary = await BehaviourService.getSummary(studentId);
            res.json(summary);
        } catch (error) {
            console.error('Get behaviour summary error:', error);
            res.status(500).json({ error: 'Failed to fetch behaviour summary' });
        }
    }
}

module.exports = BehaviourController;
