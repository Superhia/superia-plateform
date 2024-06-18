'use client'
import Login from '../components/login/Login';

const LoginPage = () => {
  return (
    <main className="flex text-black min-h-screen flex-col h-screen items-left p-14 bg-white">
    <div>
      <h1 className="text-4xl font-semibold text-center py-7">Login</h1>
      <Login />
    </div>
    </main>
  );
};

export default LoginPage;