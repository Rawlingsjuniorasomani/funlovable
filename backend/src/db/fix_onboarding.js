require('dotenv').config();
const pool = require('./pool');

async function fixOnboarding() {
    const client = await pool.connect();
    try {
        const email = 'beatriceafrifaantwi@gmail.com';
        console.log(`Fixing onboarding status for ${email}...`);

        const res = await client.query(
            'UPDATE users SET is_onboarded = true WHERE email = $1 RETURNING id, email, is_onboarded',
            [email]
        );

        if (res.rows.length > 0) {
            console.log('Success:', res.rows[0]);
        } else {
            console.log('User not found');
        }

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

fixOnboarding();
