const ProgressService = require('../services/ProgressService');

class ProgressController {
    static async trackLessonView(req, res) {
        try {
            const { lesson_id, duration_seconds, completed } = req.body;

            if (!lesson_id) {
                return res.status(400).json({ error: 'Lesson ID is required' });
            }

            const view = await ProgressService.trackLessonView({
                lesson_id,
                student_id: req.user.id,
                duration_seconds,
                completed
            });

            res.status(201).json(view);
        } catch (error) {
            console.error('Track lesson view error:', error);
            res.status(500).json({ error: 'Failed to track lesson view' });
        }
    }

    static async getStudentProgress(req, res) {
        try {
            const { studentId } = req.params;
            const { lesson_id } = req.query;

            const progress = await ProgressService.getStudentProgress(studentId, { lesson_id });
            res.json(progress);
        } catch (error) {
            console.error('Get student progress error:', error);
            res.status(500).json({ error: 'Failed to fetch progress' });
        }
    }

    static async getAnalytics(req, res) {
        try {
            const { studentId } = req.params;
            const { subject_id } = req.query;

            const analytics = await ProgressService.getAnalytics(studentId, subject_id);
            res.json(analytics);
        } catch (error) {
            console.error('Get analytics error:', error);
            res.status(500).json({ error: 'Failed to fetch analytics' });
        }
    }
}

module.exports = ProgressController;
