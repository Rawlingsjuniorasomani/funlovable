const axios = require('axios');
const PaymentModel = require('../models/PaymentModel');
const SubscriptionModel = require('../models/SubscriptionModel');
const pool = require('../db/pool');

class PaymentService {
    static async verifyPayment(reference) {
        try {
            // 1. Verify with Paystack
            const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            });

            const data = response.data.data;

            if (data.status === 'success') {
                // 2. Update Payment Record
                await PaymentModel.updateStatus(reference, 'success');

                // 3. Update Parent/User Subscription
                const payment = await PaymentModel.findByReference(reference);

                if (payment) {
                    // Default to 30 days or fetch from plan logic
                    const durationDays = 30;
                    const startDate = new Date();
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + durationDays);

                    // Update subscription in subscriptions table
                    // fetch plan details if needed, or defaults
                    const planId = payment.plan_id;
                    // ideally we fetch plan details to get name/amount if not in payment

                    await SubscriptionModel.create({
                        user_id: payment.user_id,
                        plan_id: planId,
                        plan_name: 'Premium', // Placeholder or fetch actual
                        amount: payment.amount,
                        status: 'active',
                        start_date: startDate,
                        expires_at: endDate,
                        payment_method: 'paystack'
                    });
                }

                return { status: 'success', data };
            } else {
                await PaymentModel.updateStatus(reference, 'failed');
                return { status: 'failed' };
            }

        } catch (error) {
            console.error('Paystack Verify Error:', error.message);
            throw new Error('Payment verification failed');
        }
    }

    static async initializePayment(user, planId, amount) {
        try {
            const email = user.email;
            const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/payment/verify`; // Frontend verification route

            // 1. Initialize with Paystack
            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email,
                    amount: Math.round(Number(amount) * 100), // Ensure integer Kobo/Pesewas
                    currency: 'GHS', // Ghanaian Cedis
                    callback_url: callbackUrl,
                    metadata: {
                        plan_id: planId,
                        user_id: user.id
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const { authorization_url, access_code, reference } = response.data.data;

            // 2. Create Pending Payment Record
            await PaymentModel.create({
                user_id: user.id,
                plan_id: planId,
                amount,
                reference,
                paystack_reference: access_code,
                status: 'pending'
            });

            return { authorization_url, reference };

        } catch (error) {
            console.error('Paystack Init Error:', error.response?.data || error.message);
            throw new Error('Payment initialization failed');
        }
    }
}

module.exports = PaymentService;
