import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

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

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT id, email, created_at FROM users');
      res.status(200).json(result.rows);
    } catch (err) {
      const error = err as PgError;
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users', error });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

