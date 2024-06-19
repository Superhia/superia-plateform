'use client'
import Login from '../components/login/Login';
import Register from '../components/register/Register';

const LoginPage = () => {
  return (
    <main className="flex text-black min-h-screen flex-col h-screen items-left p-14 bg-white">
    <div>
    <h1 className="text-4xl font-semibold text-center py-7"> Découvrez Superia,</h1>
      <p className="text-center py-2.5 mx-32 px-32">
        La première application qui utilise l'IA générative pour l'analyse de marque employeur.
        Grâce à Superia, vous pouvez désormais exploiter pleinement le potentiel de votre site carrière,
        en analysant et optimisant leur contenu pour attirer les meilleurs talents.
      </p>
      <div className="flex flex-col items-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold py-7">Tu as déjà un compte</h2>
          <Login />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold py-7">Inscrit toi et découvre Superia</h2>
          <Register />
        </div>
      </div>
    </div>
    </main>
  );
};

export default LoginPage;