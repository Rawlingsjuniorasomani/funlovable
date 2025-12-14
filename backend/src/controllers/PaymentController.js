const PaymentService = require('../services/PaymentService');

class PaymentController {
    static async verify(req, res) {
        try {
            const { reference } = req.params;
            const result = await PaymentService.verifyPayment(reference);
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Verification failed' });
        }
    }

    static async init(req, res) {
        try {
            const { planId, amount } = req.body;
            const result = await PaymentService.initializePayment(req.user, planId, amount);
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Initialization failed' });
        }
    }

    static async getPayments(req, res) {
        try {
            const PaymentModel = require('../models/PaymentModel');
            const payments = await PaymentModel.findByUser(req.user.id);
            res.json(payments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch payments' });
        }
    }
}

module.exports = PaymentController;
