const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for port 465, false for 587
    //   service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendMail = async ({ to, subject, html }) => {
    try {
      const info = await transporter.sendMail({
        from: `"YourApp" <${process.env.EMAIL_USER}>`, // sender address
        to,
        subject,
        html,
      });
      console.log("Email sent:", info.messageId);
    } catch (err) {
      console.error("Email sending failed:", err.message);
      throw new Error("Failed to send email");
    }
};
  
module.exports = { 
    transporter,
    sendMail,
};
