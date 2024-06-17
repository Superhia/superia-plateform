import Register from '../components/register/Register';

const RegisterPage = () => {
  return (
    <main className="flex text-black min-h-screen flex-col items-left p-14 bg-white">
    <div>
      <h1 className="text-4xl font-semibold text-center py-7">Register</h1>
      <Register />
    </div>
    </main>
  );
};

export default RegisterPage;
