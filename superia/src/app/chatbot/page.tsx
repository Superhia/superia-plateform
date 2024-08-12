import Image from "next/image";
import Link from "next/link";
import Chatbot from './ChatbotForm.client';

export default function Chatbotpage() {
  return (
    
    <main className="flex text-black min-h-screen flex-col items-left p-14 bg-white">
      <Link href={"/"}>
      <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <nav className="flex justify-end">
		<ul className="flex space-x-5 mx-auto -mt-5 mr-4" id="menu">
			<li><Link href={"scrapping"}>ScanRH</Link></li>
			<li><Link href={"parsing"}>DocuParse</Link></li>
			<li><Link href={"chatpdf"}>YoutubeScan</Link></li>
	  </ul>
		</nav>
    <h1 className="text-4xl font-semibold text-center py-7">Posez vos questions à votre site web</h1>
    <p className="text-center py-2.5 mx-32 px-32">La première application qui utiliser lIA générative pour lanalyse de marque employeur. Grâce à Superia, vous pouvez désormais exploiter pleinement le potentiel de votre site carrière, en analysant et optimisant leur contenu pour attirer les meilleurs talents.</p>
    <div className="mx-auto py-14 bg-white"><Chatbot/></div>
    </main>
    
  );
}