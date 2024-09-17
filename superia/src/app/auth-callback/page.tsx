'use client';

import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';

const AuthCallback = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    // Ensure this code only runs on the client side
    if (typeof window !== 'undefined') {
      if (!isLoading) {
        if (isAuthenticated) {
          router.push('/');
        } else {
          router.push('/api/auth/login');
        }
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>Login successful! Redirecting...</div>;
};

export default AuthCallback;

