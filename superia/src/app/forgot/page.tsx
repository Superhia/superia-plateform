import Image from "next/image";
import Link from "next/link";
import ForgotPassword from "../components/ForgotForm";

export default function ForgotForm() {
  return (
    
    <main className="flex text-black min-h-screen flex-col items-left p-14 bg-white">
      <Link href={"/"}>
      <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <nav className="flex justify-end">
        <ul className="flex space-x-5 -mt-5 mr-4" id="menu">
          <li><Link href={"tarif"}>Tarifs</Link></li>
          <li><Link href={"https://inbound.lasuperagence.com/blog"}>Blog</Link></li>
          <li><Link href={"login"}>Connexion</Link></li>
        </ul>
      </nav>
    <h1 className="text-4xl font-semibold text-center py-7">Vous avez oublié votre mots de passe</h1>
    <p className="text-center py-2.5 mx-32 px-32">La première application qui utiliser lIA générative pour lanalyse de marque employeur. Grâce à Superia, vous pouvez désormais exploiter pleinement le potentiel de votre site carrière, en analysant et optimisant leur contenu pour attirer les meilleurs talents.</p>
    <div className="mx-auto py-14 bg-white"><ForgotPassword/></div>
    </main>
    
  );
}