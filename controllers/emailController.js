const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service:'gmail', 
    auth:{user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS}
});

const sendVerificationEmail = (toEmail, userName, code) => {
    const mailOptions = {
      from: `"Cartful App" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Cartful - Email Verification',
      text: `Hi ${userName},\n\nThank you for registering with Cartful!\n\nYour verification code is:\n\n${code}\n\nBest regards,\nCartful Team\n
Please click the link below or visit the page to verify your email:
http://localhost:8000/verifyEmail`
    };
  
     transporter.sendMail(mailOptions).then(() => {
      console.log(` Email sent to ${toEmail} with code ${code}`);
    }).catch(err => {
      console.log(` Failed to send email to ${toEmail}`, err);
    });
  };

  console.log('EMAIL:', process.env.EMAIL_USER);
console.log('PASS:', process.env.EMAIL_PASS);
  
  module.exports = sendVerificationEmail;