import Link from "next/link";
import ParsingForm  from "./ParsingForm.client";

export default function Parsing() {
  return (
    <main className="flex min-h-screen flex-col items-left p-14 bg-white">
      <Link href={"/"}>
      <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <nav className="flex">
		<ul className="flex space-x-5 mx-auto -mt-5" id="menu">
			<li><Link href={"scrapping"}>ScanRH</Link></li>
			<li><Link href={"parsing"}>DocuParse</Link></li>
			<li><Link href={"chatpdf"}>ChatDoc</Link></li>
	  </ul>
		</nav>
    <h1 className="text-4xl font-semibold text-center py-7">Pose des questions à ton Fichier</h1>
    <p className="text-center mx-32 px-32">Superia simplifie la gestion documentaire grâce à son outil de parsing intelligent, capable de traiter et dorganiser efficacement tous types de documents, vous permettant de gagner du temps et daméliorer votre efficacité opérationnelle.</p>
      <div className="items-center mx-auto py-14">
       
        <ParsingForm/>
      </div>
    </main>
  );
}