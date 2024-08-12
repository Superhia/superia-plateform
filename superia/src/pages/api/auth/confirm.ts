import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { token } = req.query;
    const client = await pool.connect();

    try {
      const result = await client.query('UPDATE users SET confirmed = true WHERE confirmation_token = $1 RETURNING *', [token]);

      if (result.rowCount === 0) {
        const message = encodeURIComponent('Token invalid ou expiré');
        return res.redirect(`/login?error=${message}`);
      }

      const successMessage = encodeURIComponent('Email confirmé avec succès !');
      res.redirect(`/login?success=${successMessage}`);
    } catch (error) {
      console.error('Error confirming email:', error);
      const errorMessage = encodeURIComponent('Erreur de confirmation du mail');
      res.redirect(`/login?error=${errorMessage}`);
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ message: 'Method non permise' });
  }
};