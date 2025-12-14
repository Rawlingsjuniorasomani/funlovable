const pool = require('../db/pool');
const crypto = require('crypto');

class OtpService {
    static async generateOTP(userId, type = 'general') {
        // Generate 6-digit code
        const code = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store in DB, invalidate previous codes of same type for this user
        await pool.query('DELETE FROM otps WHERE user_id = $1 AND type = $2', [userId, type]);

        await pool.query(
            'INSERT INTO otps (user_id, code, type, expires_at) VALUES ($1, $2, $3, $4)',
            [userId, code, type, expiresAt]
        );

        // MOCK: In production, send via Email/SMS
        console.log(`🔐 [MOCK OTP] Generated for user ${userId} (${type}): ${code}`);

        return code;
    }

    static async verifyOTP(userId, code, type = 'general') {
        const result = await pool.query(
            'SELECT * FROM otps WHERE user_id = $1 AND code = $2 AND type = $3',
            [userId, code, type]
        );

        if (result.rows.length === 0) {
            return false;
        }

        const otp = result.rows[0];
        if (new Date() > new Date(otp.expires_at)) {
            await pool.query('DELETE FROM otps WHERE id = $1', [otp.id]);
            return false; // Expired
        }

        // consume OTP
        await pool.query('DELETE FROM otps WHERE id = $1', [otp.id]);
        return true;
    }
}

module.exports = OtpService;
