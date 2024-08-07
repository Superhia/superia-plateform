'use client'
import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleForgotPassword = async () => {
    setMessage('');
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Please check your email to reset your password.');
      } else {
        setMessage(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setMessage('Failed to send password reset email.');
    }
  };

  return (
    <div>
      <input
      className='block w-full mb-5 rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6'
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Entre ton email"
        required
      />
      <button onClick={handleForgotPassword}
      className='p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8'
      >Envoi le lien pour réinitialiser</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
