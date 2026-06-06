const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
        throw new Error('Gmail SMTP is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in api/.env.');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });
};

const sendOtpEmail = async ({ to, fullName, otp }) => {
    const transporter = createTransporter();
    const from = process.env.MAIL_FROM || process.env.GMAIL_USER;

    await transporter.sendMail({
        from,
        to,
        subject: 'Inventory account verification code',
        text: [
            `Hello ${fullName || 'User'},`,
            '',
            `Your verification code is ${otp}.`,
            'Use this code to set your new password. It expires in 10 minutes.',
            '',
            'If you did not request this account, please contact your administrator.',
        ].join('\n'),
    });
};

module.exports = { sendOtpEmail };
