'use client'
import Login from '../components/login/Login';
import Register from '../components/register/Register';
import Link from 'next/link';

const LoginPage = () => {
  return (
    <main className="flex text-black min-h-screen flex-col h-screen items-left p-14 bg-white">
      <Link href={"/"}>
      <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <nav className="flex justify-end">
		<ul className="flex space-x-5 mx-auto -mt-5 mr-4" id="menu">
			<li><Link href={"tarif"}>Tarifs</Link></li>
			<li><Link href={"https://inbound.lasuperagence.com/blog"}>Blog</Link></li>
			<li><Link href={"login"}>Connexion</Link></li>
	  </ul>
		</nav>
    <div>
    <h1 className="text-4xl font-semibold text-center py-7"> Découvrez Superia,</h1>
      <p className="text-xl text-center py-2.5 mx-32 px-32">
      Superia n’est qu’à quelques clics ! Pour accéder aux services proposés par Superia, identifiez-vous ou créez un nouveau compte.
      </p>
      <div className="flex justify-center items-center bg-white">
        <div className="w-1/2 text-center mx-32">
          <h2 className="text-2xl font-semibold py-7">Vous avez déjà un compte ? Saisissez votre email et votre mot de passe pour aller sur la plateforme.</h2>
          <Login />
        </div>
        <div className="w-1/2 text-center mx-32">
          <h2 className="text-2xl font-semibold py-7">Inscrivez-vous et découvrez la pleine puissance de Superia ! </h2>
          <Register />
        </div>
      </div>
    </div>
    </main>
  );
};

export default LoginPage;