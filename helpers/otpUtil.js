const otpGenerator = require('otp-generator');
const SmtpOtp = require('../model/smtpSetupModel');

const generateAndStoreOtp = async (email, purpose = 0) => {
  const otp = otpGenerator.generate(4, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  
  await SmtpOtp.updateOne(
    { email },
    { otp, purpose, createdAt: new Date() },
    { upsert: true }
  );

  return otp;
};

module.exports = {
  generateAndStoreOtp,
};
