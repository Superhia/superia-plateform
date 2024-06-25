import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const tokenCookie = req.cookies.get('auth-token');
  const token = tokenCookie ? tokenCookie.value : null;

  console.log('Token:', token);  // Log the token

  // Redirect to login if not logged in
  if (!token) {
    console.log('No token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    console.log('Payload:', payload);  // Log the payload to ensure it contains userId and role

    // Redirect to login if accessing /dashboard and not an admin
    if (req.nextUrl.pathname.startsWith('/dashboard') && payload.role !== 'admin') {
      console.log('Not an admin, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Continue to the requested page if logged in
    console.log('Token verified, proceeding to:', req.nextUrl.pathname);
    return NextResponse.next();
  } catch (error) {
    console.log('Token verification failed:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [ '/parsing', '/dashboard', '/chatpdf','/scrapping', '/chatbot' ], // Add other routes if needed
};
