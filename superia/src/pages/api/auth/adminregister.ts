import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, adminSecret } = req.body;

  // Logging the request body and environment variables for debugging
  console.log('Request body:', req.body);
  console.log('Expected ADMIN_SECRET:', process.env.ADMIN_SECRET);

  if (!email || !password || !adminSecret) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).json({ message: 'Email, mots de passe, et admin secret sont requis' });
  }

  // Ensure the admin secret is correct
  if (adminSecret !== process.env.ADMIN_SECRET) {
    console.log('Validation failed: Invalid admin secret');
    return res.status(403).json({ message: 'Admin secret invalide' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      console.log('Validation failed: Email already exists');
      return res.status(400).json({ message: 'Email existe déjà' });
    }

    await client.query('INSERT INTO users (email, password, role) VALUES ($1, $2, $3)', [email, hashedPassword, 'admin']);
    client.release();

    console.log('Admin user created successfully');
    return res.status(201).json({ message: 'Utilisateur Admin enregistrer avec succès !' });
  } catch (error) {
    const err = error as Error;
    console.error('Error registering admin user:', err.message);
    return res.status(500).json({ message: "Erreur denregistrement de l'admin", error: err.message });
  }
};
