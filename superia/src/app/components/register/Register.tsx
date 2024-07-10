'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');  // New state for success message
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');  // Clear previous errors
    setSuccess('');  // Clear previous success message

    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password: hashedPassword }),
    });

    if (res.ok) {
      setSuccess('Registration successful! Please check your email to confirm your registration.');
    } else {
      const result = await res.json();
      setError(result.message);
    }
  };

  return (
    <form className='container' onSubmit={handleSubmit}>
      <input
        className='block w-full mb-5 rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6'
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        className='block w-full mb-5 rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6'
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button 
        className='p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8'
        type="submit"
      >
        Je m'enregistre
      </button>
    </form>
  );
};

export default Register;
