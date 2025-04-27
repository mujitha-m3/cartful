const nodemailer = require('nodemailer');
require('dotenv').config(); // Load email and password from .env file

// 2. Create a function to send the email
async function sendTestEmail() {
  try {
    // 3. Set up the mail transporter (connects your app to Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS  // your App Password (NOT your real Gmail password)
      }
    });

    // 4. Write the email details
    const mailOptions = {
      from: `"Cartful App" <${process.env.EMAIL_USER}>`,
      to: 'mujitha.m3@gmail.com',  // 🔁 Replace with your email to receive test
      subject: 'Cartful Email Test',
      text: '✅ This is a test email sent using Node.js and Nodemailer!'
    };

    // 5. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);

  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
}

// 6. Run the function
sendTestEmail();
