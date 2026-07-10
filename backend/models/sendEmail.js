const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // ১. ক্রিয়েট ট্রান্সপোর্টার (যে সার্ভিস ব্যবহার করে ইমেইল পাঠানো হবে)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // আপনার ইমেইল
            pass: process.env.EMAIL_PASS, // আপনার ইমেইলের পাসওয়ার্ড বা অ্যাপ পাসওয়ার্ড
        },
    });

    // 2. ইমেইলের অপশনগুলো ডিফাইন করা
    const mailOptions = {
        from: `Mohammad Abdullah <${process.env.EMAIL_USER}>`, // প্রেরকের নাম ও ইমেইল
        to: options.email, // প্রাপকের ইমেইল
        subject: options.subject, // বিষয়
        html: options.html, // HTML বডি
    };

    // 3. ইমেইল পাঠানো
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;