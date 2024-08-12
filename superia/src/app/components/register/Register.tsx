'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(''); // New state for phone number
  const [name, setName] = useState(''); // New state for name
  const [surname, setSurname] = useState(''); // New state for surname
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null); // State for reCAPTCHA token
  const router = useRouter();

  useEffect(() => {
    const loadRecaptchaScript = () => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'register' }).then((token: string) => {
              setRecaptchaToken(token);
            });
          });
        }
      };
      document.body.appendChild(script);
    };

    loadRecaptchaScript();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!recaptchaToken) {
      setError('Erreur reCAPTCHA verification. Merci de rafraichir la page.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password: hashedPassword, phone, name, surname, recaptchaToken }),
    });

    if (res.ok) {
      setSuccess('Inscription avec succès ! Merci de vérifier vos mails pour confirmer votre inscription.');
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
        placeholder="Email*"
        required
      />
      <input
        className='block w-full mb-5 rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6'
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom*"
        required
      />
      <input
        className='block w-full mb-5 rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6'
        type="text"
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
        placeholder="Prénom *"
        required
      />
      <input
        className='block w-full mb-5 rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6'
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Téléphone"
      />
      <div className='relative mb-5'>
        <input
          className='block w-full rounded-md border-0 py-2.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6'
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mots de passe *"
          required
        />
        <button
          type="button"
          className='absolute inset-y-0 right-0 flex items-center px-4 text-gray-600'
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? 'Cacher' : 'Montrer'}
        </button>
      </div>
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
