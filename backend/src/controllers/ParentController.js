const ParentService = require('../services/ParentService');

class ParentController {
    static async addChild(req, res) {
        try {
            // req.user.id is the User ID. 
            // We need to verify if this user is a parent and get their profile? 
            // For now, simpler: we assume the logged in user IS the parent.

            const { name, age, grade } = req.body;
            const result = await ParentService.addChild(req.user.id, { name, age, grade });

            res.status(201).json({
                message: 'Child added successfully',
                child: result.child,
                studentCredentials: result.studentUser
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to add child' });
        }
    }

    static async getChildren(req, res) {
        try {
            const children = await ParentService.getChildren(req.user.id);
            res.json(children);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch children' });
        }
    }

    static async getChildProgress(req, res) {
        try {
            const { childId } = req.params;
            // Security check: ensure this child belongs to the logged-in parent
            const children = await ParentService.getChildren(req.user.id);
            const isLinked = children.some(c => c.id === childId);

            if (!isLinked) {
                return res.status(403).json({ error: 'Unauthorized access to this child' });
            }

            const progress = await ParentService.getChildProgress(childId);
            if (!progress) {
                return res.status(404).json({ error: 'Child not found' });
            }

            res.json(progress);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch child progress' });
        }
    }
}

module.exports = ParentController;
