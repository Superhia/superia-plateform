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
          <h1 className="text-2xl font-bold mb-4">Email Confirmé</h1>
          <p>Votre email à été confirmé avec succès. Vous pouvez vous connecter.</p>
          <button
            className="mt-4 p-2 bg-blue-500 text-white rounded"
            onClick={() => router.push('/login')}
          >
            Connexion
          </button>
        </div>
      )}
      {status === 'error' && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p>Il y a eu une erreur dans la confirmation de lemail. merci de rééssayer ou de contactez le support.</p>
        </div>
      )}
    </div>
  );
};

const ConfirmPage = () => {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <ConfirmPageContent />
    </Suspense>
  );
};

export default ConfirmPage;
