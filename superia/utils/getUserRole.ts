import { parse } from 'cookie';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface DecodedToken extends JwtPayload {
  role: string;
}

export const getUserRole = (): string | null => {
  if (typeof document !== 'undefined') {
    const cookies = parse(document.cookie);
    const token = cookies['auth-token'];
    console.log('Token:', token); // Debugging log

    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET as string) as DecodedToken;
        console.log('Decoded token:', decodedToken); // Debugging log

        if (decodedToken && typeof decodedToken.role === 'string') {
          console.log('Role found in token:', decodedToken.role); // Debugging log
          return decodedToken.role;
        } else {
          console.log('Role not found in decoded token'); // Debugging log
        }
      } catch (error) {
        console.error('Failed to decode token', error);
        return null;
      }
    } else {
      console.log('No token found in cookies'); // Debugging log
    }
  } else {
    console.log('Document is undefined'); // Debugging log
  }
  return null;
};
