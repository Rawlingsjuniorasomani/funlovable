const MessagingService = require('../services/MessagingService');

class MessagingController {
    static async sendMessage(req, res) {
        try {
            const { recipient_id, subject, message, parent_message_id } = req.body;

            if (!recipient_id || !subject || !message) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const sent = await MessagingService.sendMessage({
                sender_id: req.user.id,
                recipient_id,
                subject,
                message,
                parent_message_id
            });

            res.status(201).json(sent);
        } catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    }

    static async getInbox(req, res) {
        try {
            const messages = await MessagingService.getInbox(req.user.id);
            res.json(messages);
        } catch (error) {
            console.error('Get inbox error:', error);
            res.status(500).json({ error: 'Failed to fetch inbox' });
        }
    }

    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const updated = await MessagingService.markAsRead(id);

            if (!updated) {
                return res.status(404).json({ error: 'Message not found' });
            }

            res.json(updated);
        } catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).json({ error: 'Failed to mark message as read' });
        }
    }

    static async createAnnouncement(req, res) {
        try {
            const { subject_id, class_name, title, content, priority } = req.body;

            if (!title || !content) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const announcement = await MessagingService.createAnnouncement({
                teacher_id: req.user.id,
                subject_id,
                class_name,
                title,
                content,
                priority
            });

            res.status(201).json(announcement);
        } catch (error) {
            console.error('Create announcement error:', error);
            res.status(500).json({ error: 'Failed to create announcement' });
        }
    }

    static async getAnnouncements(req, res) {
        try {
            const { subject_id, class_name } = req.query;
            const announcements = await MessagingService.getAnnouncements({ subject_id, class_name });
            res.json(announcements);
        } catch (error) {
            console.error('Get announcements error:', error);
            res.status(500).json({ error: 'Failed to fetch announcements' });
        }
    }
}

module.exports = MessagingController;
