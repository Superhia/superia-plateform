import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
});

interface CustomError extends Error {
  code?: string;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    const client = await pool.connect();

    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }

      console.log('JWT_SECRET:', process.env.JWT_SECRET);  // Ensure the secret is accessed correctly

      const token = sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      console.log('Generated Token:', token);  // Log the generated token

      res.setHeader('Set-Cookie', serialize('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400,
        path: '/',
      }));

      console.log('Login successful, token set');
      return res.status(200).json({ message: 'Login successful' });
    } catch (err) {
      const error = err as CustomError;
      console.error('Error during login:', error.message);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
