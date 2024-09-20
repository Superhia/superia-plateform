// components/LoginButton.js
import React from 'react';

const LoginButton = () => (
  <button onClick={() => (window.location.href = '/api/auth/login')}>
    Connexion
  </button>
);

export default LoginButton;
