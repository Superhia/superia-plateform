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
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      res.status(200).json({ message: 'Email confirmed successfully' });
    } catch (error) {
      console.error('Error confirming email:', error);
      res.status(500).json({ message: 'Error confirming email', error });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
