// src/pages/api/auth/validate-recaptcha.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const validateRecaptcha = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { recaptchaToken } = req.body;

  try {
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
      },
    });

    const { success } = response.data;

    if (!success) {
      return res.status(400).json({ message: 'reCAPTCHA validation failed' });
    }

    res.status(200).json({ message: 'reCAPTCHA validated successfully' });
  } catch (error) {
    console.error('Error validating reCAPTCHA:', error);
    res.status(500).json({ message: 'Error validating reCAPTCHA', error });
  }
};

export default validateRecaptcha;
