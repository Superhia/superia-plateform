'use client';

import { useRouter } from 'next/navigation';

const Logout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    // Clear the auth token cookie
    document.cookie = 'auth-token=; Max-Age=0; path=/;';

    // Optionally, you can make an API call to handle server-side logout logic
    // await fetch('/api/auth/logout', { method: 'POST' });

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


