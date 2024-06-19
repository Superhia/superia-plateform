import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const tokenCookie = req.cookies.get('auth-token');
  const token = tokenCookie ? tokenCookie.value : null;

  console.log('Token:', token);

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.log('Token verification failed:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/','/parsing', '/scrapping', '/dashboard', '/chatpdf', '/chatbot'], // Add other routes if needed
};
