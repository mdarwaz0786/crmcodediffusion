import nodemailer from 'nodemailer';
import dotenv from "dotenv";

// Dotenv configuration
dotenv.config();

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL_ID,
    pass: process.env.SENDER_EMAIL_APP_PASSWORD,
  },
});

// Function to send email
export const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL_ID,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
  } catch (error) {
    console.error('Error while sending email:', error.message);
  };
};