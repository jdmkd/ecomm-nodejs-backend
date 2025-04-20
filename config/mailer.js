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
      
      if (!to || !subject || !html) {
        console.error(`Email sending aborted: Missing required fields — ${[
          !to ? "to" : null,
          !subject ? "subject" : null,
          !html ? "html content" : null
        ].filter(Boolean).join(", ")}`);

        throw new Error("Missing required email fields: to, subject, or html");
      }

      const info = await transporter.sendMail({
          from: `"EcommApp" <${process.env.EMAIL_USER}>`, // sender address
          to,
          subject,
          html,
      });

      console.log(`Email successfully sent to ${to} with subject: "${subject}" [Message ID: ${info.messageId}]`);
      return true;
    } catch (err) {
      console.error(`Failed to send email to ${to || "unknown recipient"} - ${err.message}`);
      throw new Error("Failed to send email");
    }
};
  
module.exports = {
    sendMail,
};
