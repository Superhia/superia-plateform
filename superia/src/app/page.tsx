'use client'
import Image from "next/image";
import Link from "next/link";
import Logout from "../app/components/Logout";
import { getUserRole } from "../../utils/getUserRole";
import { useEffect, useState } from "react";

export default function Home() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const role = getUserRole();
    console.log('Fetched user role:', role); // Debugging log
    setRole(role);
  }, []);

  useEffect(() => {
    console.log('Role state updated:', role); // Debugging log
  }, [role]);

  return (
    <main className="flex text-black min-h-screen flex-col h-screen items-left p-14 bg-white">
      <div className="absolute top-0 right-0 m-5 -mr-5">
        <Logout />
      </div>
      <Link href={"/"}>
        <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <nav className="flex">
        <ul className="flex space-x-5 mx-auto -mt-5" id="menu">
          <li><Link href={"scrapping"}>ScanRH</Link></li>
          <li><Link href={"parsing"}>DocuParse</Link></li>
          <li><Link href={"chatpdf"}>YoutubeScan</Link></li>
        </ul>
      </nav>
      <h1 className="text-4xl font-semibold text-center py-7"> Découvrez Superia,</h1>
      <p className="text-center py-2.5 mx-32 px-32">
        La première application qui utilise l'IA générative pour l'analyse de marque employeur.
        Grâce à Superia, vous pouvez désormais exploiter pleinement le potentiel de votre site carrière,
        en analysant et optimisant leur contenu pour attirer les meilleurs talents.
      </p>
      <div className="mx-auto text-2xl">
        <button className="p-5 pl-20 pr-20 m-10 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 2xl:text-2xl 2xl:leading-8">
          <Link href={"scrapping"}>ScanRH</Link>
        </button>
        <button className="p-5 pl-20 pr-20 m-10 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 2xl:text-2xl 2xl:leading-8">
          <Link href={"parsing"}>DocuParse</Link>
        </button>
        <button className="p-5 pl-20 pr-20 m-10 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 2xl:text-2xl 2xl:leading-8">
          <Link href={"chatpdf"}>YoutubeScan</Link>
        </button>
      </div>
    </main>
  );
}
