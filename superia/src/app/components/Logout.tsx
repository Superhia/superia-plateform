'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import React from 'react';

interface LogoutProps {
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Logout: React.FC<LogoutProps> = ({ setLoggedIn }) => {
  const router = useRouter();

  const handleLogout = async () => {
    // Clear the auth token cookie using js-cookie
    Cookies.remove('authToken');

    // Make an API call to handle server-side logout logic
    await fetch('/api/auth/logout', { method: 'POST' });

    // Update client-side state
    setLoggedIn(false);

    // Redirect to login page
    router.push('/login');
  };

  return (
    <button 
      className='p-5 pl-20 pr-20 m-5 mx-40 rounded-md border-0 text-red-900 ring-1 ring-inset ring-red-300 text-xl 2xl:leading-8'
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default Logout;
