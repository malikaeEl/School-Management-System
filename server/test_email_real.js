import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const testEmail = async () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.error('FAILURE: SMTP config missing in .env');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('Sending test email...');
    await transporter.sendMail({
      from: `"Atlas Academy" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // send to self
      subject: 'Test Email from Atlas Academy',
      text: 'This is a test email to verify SMTP configuration.',
    });
    console.log('SUCCESS: Email sent successfully');
  } catch (error) {
    console.error('FAILURE: Email sending failed:', error.message);
  }
};

testEmail();
