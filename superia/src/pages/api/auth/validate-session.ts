import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.cookies['auth-token'];

  // Fallback if JWT_SECRET is not set; consider throwing an error or ensuring your environment variables are set properly.
  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

  if (!token) {
    return res.status(200).json({ isLoggedIn: false });
  }

  try {
    // Verifying the token with a fallback secret; JWT_SECRET must never be undefined
    verify(token, JWT_SECRET);
    return res.status(200).json({ isLoggedIn: true });
  } catch (error) {
    return res.status(200).json({ isLoggedIn: false });
  }
};