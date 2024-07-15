'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const ConfirmPageContent = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') : null;

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const confirmEmail = async () => {
      try {
        const res = await fetch(`/api/auth/confirm?token=${token}`);
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    confirmEmail();
  }, [token]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto text-center mt-10">
      {status === 'success' && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Email Confirmed</h1>
          <p>Your email has been confirmed successfully. You can now log in.</p>
          <button
            className="mt-4 p-2 bg-blue-500 text-white rounded"
            onClick={() => router.push('/login')}
          >
            Go to Login
          </button>
        </div>
      )}
      {status === 'error' && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>There was an error confirming your email. Please try again or contact support.</p>
        </div>
      )}
    </div>
  );
};

const ConfirmPage = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ConfirmPageContent />
    </Suspense>
  );
};

export default ConfirmPage;
