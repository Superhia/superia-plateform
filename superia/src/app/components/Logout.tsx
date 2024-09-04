'use client';

import { useRouter } from 'next/navigation';

const Logout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    // Make an API call to clear the auth-token on the server
    const response = await fetch('/api/auth/logout', { method: 'POST' });

    if (response.ok) {
      // Clear session data from localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userSurname');

      // Redirect to the login page
      router.push('/login');
    } else {
      console.error('Logout failed');
    }
  };

  return (
    <button onClick={handleLogout}>
      Deconnexion
    </button>
  );
};

export default Logout;

