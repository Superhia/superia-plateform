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
    return res.status(405).json({ message: 'Method non permise' });
  }

  const { email } = req.body;
  const client = await pool.connect();

  try {
    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpire = new Date(Date.now() + 360000); // 1 hour from now

    const { rowCount } = await client.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3 RETURNING *',
      [token, tokenExpire, email]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Pas dutilisateur trouvé avec cette adresse email.' });
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
      subject: 'Réinitialisation du mots de passe',
      text: `Vous recevez ce message parce que vous (ou quelqun dautre) a demandé à réinitialiser le mots de passe de votre compte.\n\n
        Merci de cliquer sur le lien suivant, ou coller le lien dans votre navigateur:\n\n
        https://${req.headers.host}/reset-password?token=${token}\n\n
        Si vous en avez pas fait la demande, merci d'ignorer cette email et votre mots de passe restera inchangé.\n`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Un email a été envoyé à' + email + ' avec davantage instructions.' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ message: 'Erreur en envoyant le mots de passe.' });
  } finally {
    client.release();
  }
};
