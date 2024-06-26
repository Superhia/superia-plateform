'use client'
import { useState, useEffect } from 'react';
import Link from "next/link";
import Logout from "./components/Logout";
import ScanRH_Video from "./components/ScanRH_video.client"
import ChatbotForm from './chatbot/ChatbotForm.client';

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Call the API to validate session
        const validateSession = async () => {
            try {
                const response = await fetch('/api/auth/validate-session');
                const data = await response.json();
                setIsLoggedIn(data.isLoggedIn); // Set based on the response from the server
                console.log('Logged In Status:', data.isLoggedIn);
            } catch (error) {
                console.error('Error validating session:', error);
                setIsLoggedIn(false);
            }
        };

        validateSession();
    }, []);
  return (
    <main className="flex text-black min-h-screen flex-col h-screen items-left p-14 bg-white">
      <Link href={"/"}>
        <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <nav className="flex justify-end">
        <ul className="flex space-x-5 -mt-5 mr-4" id="menu">
          <li><Link href={"tarif"}>Tarifs</Link></li>
          <li><Link href={"https://inbound.lasuperagence.com/blog"}>Blog</Link></li>
          {isLoggedIn ? (
            <li><Logout/></li>
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
      <div className="mx-auto">
                {isLoggedIn ? (
                    <>
                        <button className="p-5 pl-20 pr-20 m-10 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 2xl:text-2xl 2xl:leading-8">
                            <Link href={"scrapping"}>ScanRH</Link>
                        </button>
                        <button className="p-5 pl-20 pr-20 m-10 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 2xl:text-2xl 2xl:leading-8">
                            <Link href={"parsing"}>DocuParse</Link>
                        </button>
                        <button className="p-5 pl-20 pr-20 m-10 rounded-md border-0 text-blue-900 ring-1 ring-inset ring-blue-300 2xl:text-2xl 2xl:leading-8">
                            <Link href={"chatpdf"}>YoutubeScan</Link>
                        </button>
                    </>
                ) : (
                  <div className='flex flex-col items-center'><ScanRH_Video/>
                    <h2 className="text-2xl font-semibold py-7">Essayez maintenant !</h2>
                    <p className='py-2.5 mx-40 px-64'>Découvrez la possibilité de discuter avec votre site web.</p>
                    <div><ChatbotForm/></div>
                    </div>
                )}
            </div>
    </main>
  );
}
