// utils/auth.ts
import { IncomingMessage } from 'http';

export function isAuthenticated(req: IncomingMessage): boolean {
  // Check if the request has a valid authentication cookie/token
  const token = req.headers.cookie?.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1];
  return !!token;
}