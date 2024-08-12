// pages/api/send-email.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method non permise' });
  }

  const { name, email, message, recaptchaToken } = req.body;

  if (!name || !email || !message || !recaptchaToken) {
    console.error('Missing fields:', { name, email, message, recaptchaToken });
    return res.status(400).json({ message: 'Tout les champs sont requis' });
  }

  // Verify reCAPTCHA token
  const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
  });

  const recaptchaData = await recaptchaResponse.json();
  console.log('reCAPTCHA verification response:', recaptchaData);

  if (!recaptchaData.success || recaptchaData.score < 0.5) {
    console.error('reCAPTCHA verification failed');
    return res.status(400).json({ message: 'Erreur de vérification du reCAPTCHA, merci de rafraichir la page' });
  }

  try {
    // Create a Nodemailer transporter using your SMTP server credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Set up email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'dl.lasuperagence@gmail.com',
      subject: `Support requète venant de ${name}`,
      text: `Vous avez reçu un nouveau message venant de :\nNom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email envoyé avec succès' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Erreur en envoyant le mail' });
  }
}
