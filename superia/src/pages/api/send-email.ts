// pages/api/send-email.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Create a Nodemailer transporter using your SMTP server credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // Your SMTP host
      port: parseInt(process.env.EMAIL_PORT || '587'), // Your SMTP port
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your SMTP user
        pass: process.env.EMAIL_PASSWORD, // Your SMTP password
      },
    });

    // Set up email options
    const mailOptions = {
      from: 'accueil@thewildseeds.net',
      to: process.env.ADMIN_EMAIL, // The email address to receive the message
      subject: `Support request from ${name}`,
      text: message,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
}
