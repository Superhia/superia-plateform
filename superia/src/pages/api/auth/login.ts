import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import axios from 'axios';

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
});

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { email, password, recaptchaToken } = req.body;
    const client = await pool.connect();

    // Verify reCAPTCHA
    try {
      const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, {}, {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      });

      if (!recaptchaResponse.data.success) {
        return res.status(400).json({ message: 'Erreur de vérification du reCAPTCHA. Merci de rafraichir la page' });
      }
    } catch (error) {
      console.error('Error verifying reCAPTCHA:', error);
      return res.status(500).json({ message: 'Erreur interne dans la vérification du reCAPTCHA.' });
    }

    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Email ou mots de passe invalid' });
      }

      const user = result.rows[0];

      if (!user.confirmed && user.role !== 'admin') {
        return res.status(400).json({ message: 'Merci de confirmer votre email avant de vous connecter' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Email ou mots de passe invalid' });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET nest pas défini');
      }

      const token = sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      res.setHeader('Set-Cookie', serialize('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400,
        path: '/',
      }));

      return res.status(200).json({ message: 'Connexion réussit !' });
    } catch (error) {
      const err = error as Error;
      console.error('Error during login:', err.message);
      return res.status(500).json({ message: 'Erreur serveur interne', error: err.message });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ message: 'Method non permise' });
  }
};
