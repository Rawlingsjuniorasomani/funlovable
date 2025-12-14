require('dotenv').config();
const pool = require('./pool');
const SubscriptionModel = require('../models/SubscriptionModel');

async function repair() {
    const client = await pool.connect();
    try {
        console.log("--- Repairing Subscriptions ---");

        /*
        // General repair temporarily disabled due to schema mismatch
        // Find successful payments where user has no active subscription
        const missingSubs = await client.query(`
        SELECT DISTINCT p.user_id, p.amount, p.plan_id
        FROM payments p
        LEFT JOIN subscriptions s ON p.user_id = s.user_id
        WHERE p.status = 'success'
        AND (s.id IS NULL OR s.status != 'active')
    `);

        console.log(`Found ${missingSubs.rows.length} users with successful payments but no active subscription.`);

        for (const record of missingSubs.rows) {
            console.log(`Restoring subscription for user: ${record.user_id}`);

            // Create 30 day sub
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);

            await SubscriptionModel.create({
                user_id: record.user_id,
                plan_id: record.plan_id || 'family-plan', // Default fallback
                plan_name: 'Restored Plan',
                amount: record.amount,
                status: 'active',
                start_date: startDate,
                expires_at: endDate,
                payment_method: 'restored'
            });
            console.log('  -> Restored.');
        }
        */

        // Explicitly fix Beatrice if payment verification failed entirely previously
        const beatrice = await client.query("SELECT id FROM users WHERE email = 'beatriceafrifaantwi@gmail.com'");
        if (beatrice.rows.length > 0) {
            const uid = beatrice.rows[0].id;
            const check = await client.query("SELECT * FROM subscriptions WHERE user_id = $1", [uid]);
            if (check.rows.length === 0) {
                console.log("Forcing subscription for Beatrice (Debugging Fix)...");
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + 30);
                await SubscriptionModel.create({
                    user_id: uid,
                    plan_id: 'family', // VALID value per constraint
                    plan_name: 'Debug Fix Plan',
                    amount: 1300,
                    status: 'active',
                    start_date: startDate,
                    expires_at: endDate,
                    payment_method: 'system-fix'
                });
                console.log('  -> Fixed Beatrice.');
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

repair();
