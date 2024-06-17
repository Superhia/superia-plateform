import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'dalvik',
  host: 'localhost',
  database: 'data_superia',
  password: 'your_secure_password',
  port: 5432,
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    const client = await pool.connect();
    try {
      await client.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, password]);
      res.redirect(302, '/login');
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

