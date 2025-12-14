const PlanModel = require('../models/PlanModel');

class PlanController {
    static async getAll(req, res) {
        try {
            const plans = await PlanModel.findAll();
            res.json(plans);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch plans' });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const plan = await PlanModel.findById(id);
            if (!plan) return res.status(404).json({ error: 'Plan not found' });
            res.json(plan);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch plan' });
        }
    }

    static async create(req, res) {
        try {
            const plan = await PlanModel.create(req.body);
            res.status(201).json(plan);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create plan' });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const plan = await PlanModel.update(id, req.body);
            if (!plan) return res.status(404).json({ error: 'Plan not found' });
            res.json(plan);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update plan' });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const plan = await PlanModel.delete(id);
            if (!plan) return res.status(404).json({ error: 'Plan not found' });
            res.json({ message: 'Plan deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to delete plan' });
        }
    }
}

module.exports = PlanController;
