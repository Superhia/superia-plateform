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
      onClick={handleLogout}
    >
      Deconnection
    </button>
  );
};

export default Logout;


