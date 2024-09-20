import React from 'react';

const LogoutButton = () => (
  <button onClick={() => (window.location.href = '/api/auth/logout')}>
    Deconnexion
  </button>
);

export default LogoutButton;