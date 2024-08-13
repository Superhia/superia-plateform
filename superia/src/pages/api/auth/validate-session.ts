import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import { Pool } from 'pg';

// Configure the PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
});

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.cookies['auth-token'];

  if (!token) {
    return res.status(200).json({ isLoggedIn: false });
  }

  try {
    // Decode the JWT to get the user ID
    const decoded = verify(token, JWT_SECRET) as { userId: string };

    // Get a client from the pool
    const client = await pool.connect();

    try {
      // Query the database to get the user's name using the userId from the token
      const result = await client.query('SELECT name,surname FROM users WHERE id = $1', [decoded.userId]);

      if (result.rows.length > 0) {
        const user = result.rows[0];
        return res.status(200).json({
          isLoggedIn: true,
          user: {
            name: user.name,
            surname: user.surname,
          },
        });
      } else {
        return res.status(200).json({ isLoggedIn: false });
      }
    } catch (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ message: 'Internal server error' });
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(200).json({ isLoggedIn: false });
  }
};
