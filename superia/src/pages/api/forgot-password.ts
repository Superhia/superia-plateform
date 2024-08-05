// pages/api/forgot-password.js
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;
  const client = await pool.connect();

  try {
    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpire = new Date(Date.now() + 3600); // 1 hour from now

    const { rowCount } = await client.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3 RETURNING *',
      [token, tokenExpire, email]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'No user found with that email address.' });
    }
    const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.hostinger.com';
    const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);

    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_PORT === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
        logger: true,
        debug: true,
    });

    const mailOptions = {
      from: 'accueil@thewildseeds.net',
      to: email,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/reset-password?token=${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'An e-mail has been sent to ' + email + ' with further instructions.' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ message: 'Error on sending password reset email.' });
  } finally {
    client.release();
  }
};
