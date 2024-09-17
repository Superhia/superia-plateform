'use client';

import Image from 'next/image';
import Link from 'next/link';
import Offre_Emploi from './OffreEmploiForm.client';
import { useState, useEffect, useRef } from 'react';
import Logout from '../components/Logout';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Offre_Emploipage() {
  const { user, error, isLoading } = useUser();
  const [userName, setUserName] = useState<string>('');
  const [userSurname, setUserSurname] = useState<string>('');

  useEffect(() => {
    if (user) {
      const givenName = typeof user.given_name === 'string' ? user.given_name : '';
      const familyName = typeof user.family_name === 'string' ? user.family_name : '';
      setUserName(givenName);
      setUserSurname(familyName);
    }
  }, [user]);

  interface NavbarProps {
    isLoggedIn: boolean;
  }
  
  const Navbar: React.FC<NavbarProps> = ({ isLoggedIn }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
    const handleMouseEnter = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsDropdownOpen(true);
    };
  
    const handleMouseLeave = () => {
      timeoutRef.current = setTimeout(() => {
        setIsDropdownOpen(false);
      }, 200); // Adjust the delay time as needed
    };
  
    const handleClick = () => {
      setIsDropdownOpen((prevState) => !prevState);
    };

    return (
      <nav className="flex justify-end">
        <ul className="flex space-x-5 -mt-5 mr-4" id="menu">
          <li
            className="relative cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div onClick={handleClick} className="flex items-center">
              <Link href="produit">Produit</Link>
            </div>
            {isDropdownOpen && (
              <ul
                className="absolute left-0 top-full mt-1 w-48 bg-white shadow-lg border rounded-md z-10"
                onMouseEnter={handleMouseEnter} // Keep the dropdown open when hovering
                onMouseLeave={handleMouseLeave} // Close the dropdown with a delay when leaving the area
              >
                <li className="px-4 py-2 hover:bg-gray-100">
                  <Link href="scrapping">ScanRH</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100">
                  <Link href="parsing">DocuParse</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100">
                  <Link href="chatpdf">YoutubeScan</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100">
                  <Link href="analysis">Sentiment</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100">
                  <Link href="offreemploi">Offre Emploi</Link>
                </li>
              </ul>
            )}
          </li>
          {isLoggedIn ? (
            <li><Logout /></li>
          ) : (
            <li><Link href="/api/auth/login">Connexion</Link></li>
          )}
        </ul>
      </nav>
    );
  };

  return (
    <main className="flex text-black min-h-screen flex-col items-left p-14 bg-white">
      <Link href={"/"}>
        <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <Navbar isLoggedIn={!!user} />
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error loading session</div>
      ) : (
        <>
          {user ? (
            <>
              <h1 className="text-4xl font-semibold text-center py-7">
                Génération d'offres d'emploi sur mesure
              </h1>
              <p className="text-center py-2.5 mx-32 px-32">
                Avec SuperIA, générez des offres d'emploi simplement et personnalisez-les à votre convenance.
              </p>
              <div className="mx-auto py-14 bg-white">
                <Offre_Emploi />
              </div>
            </>
          ) : (
            <>
            <h1 className="text-4xl font-semibold text-center py-7">
              Veuillez vous connecter pour analyser vos données
            </h1>
            <div className="flex justify-center">
              <Link href="/api/auth/login">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Se connecter
                </button>
              </Link>
            </div>
          </>
          )}
        </>
      )}
    </main>
  );
}
