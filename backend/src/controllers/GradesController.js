const GradesService = require('../services/GradesService');

class GradesController {
    static async createGrade(req, res) {
        try {
            const { student_id, subject_id, term, assessment_type, assessment_id, score, max_score, grade, remarks } = req.body;

            if (!student_id || !subject_id || !term || !assessment_type || score === undefined || max_score === undefined) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const gradeRecord = await GradesService.createGrade({
                student_id,
                subject_id,
                teacher_id: req.user.id,
                term,
                assessment_type,
                assessment_id,
                score,
                max_score,
                grade,
                remarks
            });

            res.status(201).json(gradeRecord);
        } catch (error) {
            console.error('Create grade error:', error);
            res.status(500).json({ error: 'Failed to create grade' });
        }
    }

    static async getStudentGrades(req, res) {
        try {
            const { studentId } = req.params;
            const { subject_id, term } = req.query;

            const grades = await GradesService.getStudentGrades(studentId, { subject_id, term });
            res.json(grades);
        } catch (error) {
            console.error('Get student grades error:', error);
            res.status(500).json({ error: 'Failed to fetch grades' });
        }
    }

    static async updateGrade(req, res) {
        try {
            const { id } = req.params;
            const { score, max_score, grade, remarks } = req.body;

            const updated = await GradesService.updateGrade(id, { score, max_score, grade, remarks });

            if (!updated) {
                return res.status(404).json({ error: 'Grade not found' });
            }

            res.json(updated);
        } catch (error) {
            console.error('Update grade error:', error);
            res.status(500).json({ error: 'Failed to update grade' });
        }
    }

    static async deleteGrade(req, res) {
        try {
            const { id } = req.params;
            const deleted = await GradesService.deleteGrade(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Grade not found' });
            }

            res.json({ message: 'Grade deleted successfully' });
        } catch (error) {
            console.error('Delete grade error:', error);
            res.status(500).json({ error: 'Failed to delete grade' });
        }
    }

    static async generateReportCard(req, res) {
        try {
            const { student_id, term, academic_year, overall_grade, overall_percentage, teacher_remarks } = req.body;

            if (!student_id || !term || !academic_year) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const reportCard = await GradesService.generateReportCard({
                student_id,
                term,
                academic_year,
                overall_grade,
                overall_percentage,
                teacher_remarks
            });

            res.status(201).json(reportCard);
        } catch (error) {
            console.error('Generate report card error:', error);
            res.status(500).json({ error: 'Failed to generate report card' });
        }
    }

    static async getReportCard(req, res) {
        try {
            const { studentId, term, academicYear } = req.params;

            const reportCard = await GradesService.getReportCard(studentId, term, academicYear);

            if (!reportCard) {
                return res.status(404).json({ error: 'Report card not found' });
            }

            res.json(reportCard);
        } catch (error) {
            console.error('Get report card error:', error);
            res.status(500).json({ error: 'Failed to fetch report card' });
        }
    }

    static async publishReportCard(req, res) {
        try {
            const { id } = req.params;

            const published = await GradesService.publishReportCard(id);

            if (!published) {
                return res.status(404).json({ error: 'Report card not found' });
            }

            res.json(published);
        } catch (error) {
            console.error('Publish report card error:', error);
            res.status(500).json({ error: 'Failed to publish report card' });
        }
    }
}

module.exports = GradesController;
