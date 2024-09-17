'use client';

import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';

const AuthCallback = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect to the home page or dashboard after login
        router.push('/');
      } else {
        // Optionally handle the case where authentication fails
        router.push('/api/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>Login successful! Redirecting...</div>;
};

// Use getServerSideProps to disable static generation for this page
export async function getServerSideProps() {
  return {
    props: {}, // No additional props needed
  };
}

export default AuthCallback;


