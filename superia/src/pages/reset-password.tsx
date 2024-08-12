// pages/reset-password.js
'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const ResetPassword = () => {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (router.isReady) {
      const { token } = router.query;
      setToken(token as string);
    }
  }, [router.isReady, router.query]);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setMessage('Mots de passe différent.');
      return;
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Erreur dans la réinitialisation du mots de passe.');
    }
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f7f7f7' }}>
      <Link href="/">
        <img src="LaSuperAgence.png" alt="icon" style={{ height: '40px' }} />
      </Link>
      <nav style={{ display: 'flex', justifyContent: 'center',margin:'1%', width: '100%' }}>
        <ul style={{ listStyleType: 'none', margin: '0', padding: '0', display: 'flex', justifyContent: 'flex-end' }}>
          <li style={{ marginRight: '20px' }}><Link href="tarif" style={{ textDecoration: 'none', color: '#0056b3' }}>Tarifs</Link></li>
          <li style={{ marginRight: '20px' }}><Link href="https://inbound.lasuperagence.com/blog" style={{ textDecoration: 'none', color: '#0056b3' }}>Blog</Link></li>
          <li><Link href="login" style={{ textDecoration: 'none', color: '#0056b3' }}>Connexion</Link></li>
        </ul>
      </nav>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nouveau mots de passe"
          required
          style={{ padding: '8px', margin: '5px', border: '2px solid #ddd', borderRadius: '4px', width: '300px' }}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirmez le mots de passe"
          required
          style={{ padding: '8px', margin: '5px', border: '2px solid #ddd', borderRadius: '4px', width: '300px' }}
        />
        <button onClick={handleResetPassword} style={{ padding: '10px 20px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '320px', marginTop: '10px' }}>
          Réinitialiser le mots de passe
        </button>
        {message && <p style={{ color: 'black', fontSize: '14px' }}>{message}</p>}
      </div>
    </main>
  );
};


export default ResetPassword;
