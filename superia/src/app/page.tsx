'use client'
import { useState, useEffect } from 'react';
import Link from "next/link";
import Logout from "./components/Logout";
import ScanRH_Video from "./components/ScanRH_video.client"
import AgentForm from "./chatbot/AgentForm.client"
import Parsing_video from './components/Parsing_video.client';
import Youtube_video from './components/Youtube_video.client';

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [userSurname, setUserSurname] = useState('');

    useEffect(() => {
        // Call the API to validate session
        const validateSession = async () => {
            try {
                const response = await fetch('/api/auth/validate-session');
                const data = await response.json();
                setIsLoggedIn(data.isLoggedIn);
                if (data.isLoggedIn) {
                  setUserName(data.user.name); // Set user's name if logged in
                  setUserSurname(data.user.surname);
                } // Set based on the response from the server
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
          <li><Link href={"support"}>Support</Link></li>
        </ul>
      </nav>
      <div className="mx-auto">
                {isLoggedIn ? (
                    <>
                    <div><h1 className="text-4xl font-semibold text-center py-7">
                Bienvenue {userSurname} {userName}, dans votre espace personnel Superia!
              </h1>
      <p className="text-xl text-center py-2.5 mx-40 px-64">
      Découvrez Superia, la première plateforme pour la Marque Employeur utilisant l’IA générative
      </p></div>
                    <div className='grid grid-cols-3 gap-10 my-10'>
                            <div className='text-center'>
                                <Link href={"scrapping"}>
                                    <img
                                        src="ScanRH.JPG"
                                        alt="ScanRH"
                                        className="scanrh-image w-64 mx-auto"
                                    />
                                </Link>
                                <p className="mt-4">Analysez votre site carrières en 1 clic et découvrez les recommandations de l’IA</p>
                            </div>
                            <div className='text-center'>
                                <Link href={"parsing"}>
                                    <img
                                        src="Docuparse.JPG"
                                        alt="Docuparse"
                                        className="scanrh-image w-64 mx-auto"
                                    />
                                </Link>
                                <p className="mt-4">Scannez vos documents RH et interagissez avec eux de manière fluide</p>
                            </div>
                            <div className='text-center'>
                                <Link href={"chatpdf"}>
                                    <img
                                        src="Youtubescan.JPG"
                                        alt="YoutubeScan"
                                        className="scanrh-image w-64 mx-auto"
                                    />
                                </Link>
                                <p className="mt-4">Importez vos vidéos Youtube de marque employeur et découvrez ce qu’en pensent vos futurs candidats</p>
                            </div>
                        </div>
                        <div className='flex flex-col items-center py-7 mx-auto'><h2 className="text-2xl font-semibold text-center py-5">Converser avec notre agent ! </h2>
                      <AgentForm/></div>
                    </>
                ) : (
                  <div className='flex flex-col items-center py-14 mx-auto'>
                    <h1 className="text-4xl font-semibold text-center py-7">Découvrez Superia,</h1>
      <p className="text-xl text-center py-2.5 mx-40 px-64">
      Découvrez Superia, la première plateforme pour la Marque Employeur utilisant l’IA générative
      </p>
                    <div className='flex justify-center space-x-10'>
                    <div className='cursor-pointer m-10'><ScanRH_Video/></div>
                      <div className='cursor-pointer m-10'><Parsing_video/></div>
                     <div className='cursor-pointer m-10'><Youtube_video/></div>
                     </div>
                     <h2 className="text-2xl font-semibold text-center py-5">Conversez avec notre agent ! </h2>
                     <div><AgentForm/></div>
                    </div>
                )}
            </div>
    </main>
  );
}
