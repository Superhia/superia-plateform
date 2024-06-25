'use client';
import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import Logout from "./components/Logout";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check local storage or your auth API to determine if the user is logged in
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    // Here you would also handle the logout logic (e.g., API call, update state)
    localStorage.setItem('isLoggedIn', 'false');
    setIsLoggedIn(false);
  };

  return (
    <main className="flex text-black min-h-screen flex-col h-screen items-left p-14 bg-white">
      <Link href={"/"}>
        <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <nav className="flex justify-end">
        <ul className="flex space-x-5 -mt-5 mr-4" id="menu">
          <li><Link href={"tarif"}>Tarif</Link></li>
          <li><Link href={"https://lasuperagence.com"}>Blog</Link></li>
          {isLoggedIn ? (
            <li><Logout setLoggedIn={setIsLoggedIn}/></li>
          ) : (
            <li><Link href={"login"}>Connexion</Link></li>
          )}
        </ul>
      </nav>
      <h1 className="text-4xl font-semibold text-center py-7">Découvrez Superia,</h1>
      <p className="text-center py-2.5 mx-40 px-64">
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