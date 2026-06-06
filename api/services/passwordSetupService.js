const bcrypt = require('bcryptjs');
const pool = require('../connection');
const { sendOtpEmail } = require('./emailService');

const OTP_EXPIRY_MINUTES = 10;

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendPasswordChangeOtp = async (user, client = pool) => {
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await client.query(
        `UPDATE users
         SET password_change_otp_hash = $1,
             password_change_otp_expires_at = NOW() + ($2 * INTERVAL '1 minute')
         WHERE id = $3`,
        [otpHash, OTP_EXPIRY_MINUTES, user.id]
    );

    await sendOtpEmail({ to: user.email, fullName: user.full_name, otp });
};

module.exports = { sendPasswordChangeOtp };
