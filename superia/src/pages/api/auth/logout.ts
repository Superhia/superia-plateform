import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function logoutHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const serialized = serialize('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1,
    path: '/',
  });

  res.setHeader('Set-Cookie', serialized);
  res.status(200).json({ message: 'Deconnection réussit !' });
}