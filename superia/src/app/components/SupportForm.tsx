// components/SupportForm.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Joi from 'joi';
import { useRouter } from 'next/navigation';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

interface FormState {
  name: string;
  email: string;
  message: string;
}

const SupportForm: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    message: '',
  });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const schema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Name is required',
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
      'string.email': 'Valid email is required',
      'string.empty': 'Email is required',
    }),
    message: Joi.string().required().messages({
      'string.empty': 'Message is required',
    }),
  });

  useEffect(() => {
    const loadRecaptchaScript = () => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'support_form' }).then((token: string) => {
              setRecaptchaToken(token);
            });
          });
        }
      };
      document.body.appendChild(script);
    };

    loadRecaptchaScript();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate form inputs
    const { error } = schema.validate(formState, { abortEarly: false });
    if (error) {
      setResponseMessage(error.details.map(detail => detail.message).join('. '));
      return;
    }

    if (!recaptchaToken) {
      setError('reCAPTCHA verification failed. Please try again.');
      return;
    }

    setIsLoading(true);
    setResponseMessage(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formState, recaptchaToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send email');
      }

      setResponseMessage('Your message has been sent successfully!');
      setFormState({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      setResponseMessage('Failed to send message. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="support-form">
      <div>
        <input
        className='block w-full rounded-md border-0 py-2.5 pl-7 m-5 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6'
          type="text"
          id="name"
          name="name"
          value={formState.name}
          onChange={handleInputChange}
          required
          placeholder='Nom'
        />
      </div>
      <div>
        <input
        className='block w-full rounded-md border-0 py-2.5 pl-7 pr-20 m-5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6'
          type="email"
          id="email"
          name="email"
          value={formState.email}
          onChange={handleInputChange}
          required
          placeholder='Email'
        />
      </div>
      <div>
        <textarea
        className='block w-full rounded-md border-0 py-2.5 m-5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl 2xl:leading-6'
          id="message"
          name="message"
          value={formState.message}
          onChange={handleInputChange}
          placeholder='Message'
          required
        />
      </div>
      <button type="submit" disabled={isLoading}
      className='p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 text-xl 2xl:leading-8'>
        {isLoading ? 'Sending...' : 'Send Message'}
      </button>
      {responseMessage && <p>{responseMessage}</p>}
    </form>
  );
};

export default SupportForm;
