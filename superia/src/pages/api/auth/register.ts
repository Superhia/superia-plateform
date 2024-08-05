import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import axios from 'axios';

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
});

interface PgError extends Error {
  code?: string;
}

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.hostinger.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

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

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, phone, name, surname, recaptchaToken } = req.body;
  console.log('Received request:', { email, password, phone, name, surname, recaptchaToken });

  // Validate required fields
  if (!email || !password || !name || !surname) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const client = await pool.connect();
  const token = crypto.randomBytes(32).toString('hex');
  const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/confirm?token=${token}&redirect=/login`;

  
  // Log confirmation URL
  console.log('Generated confirmation URL:', confirmationUrl);

  // Verify reCAPTCHA
  try {
    const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, {}, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
      },
    });

    console.log('reCAPTCHA response:', recaptchaResponse.data);

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return res.status(500).json({ message: 'Internal server error during reCAPTCHA verification.' });
  }

  try {
    await client.query(
      'INSERT INTO users (email, password, phone, name, surname, confirmation_token) VALUES ($1, $2, $3, $4, $5, $6)',
      [email, password, phone, name, surname, token]
    );

    // Send confirmation email to the user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Confirmation',
      html: `<p>Please confirm your email by clicking the following link: <a href="${confirmationUrl}">${confirmationUrl}</a></p>`,
    });

    // Send registration details email to the admin
    const adminEmail = process.env.ADMIN_EMAIL || 'logerdalvik@gmail.com';
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: 'New User Registration',
      html: `<p>A new user has registered. Here are the details:</p>
             <ul>
               <li>Name: ${name}</li>
               <li>Surname: ${surname}</li>
               <li>Email: ${email}</li>
               <li>Phone: ${phone}</li>
             </ul>`,
    });

    res.status(200).json({ message: 'User registered successfully. Please check your email to confirm your registration.' });
  } catch (err) {
    const error = err as PgError;
    if (error.code === '23505') {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Error registering user', error });
    }
  } finally {
    client.release();
  }
};
