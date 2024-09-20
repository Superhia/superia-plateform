'use client';
import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import ChatbotForm from "../chatbot/ChatbotForm.client";
import BPIFranceForm from './BPIFranceForm.client';
import AXAForm from './AXAForm.client';
import OrangeForm from './OrangeForm.client';
import LaPosteForm from './LaPosteForm.client';
import DecathlonForm from './DecathlonForm.client';
import GeneraliForm from './GeneraliForm.client';
import ImageScanRH from '../components/ScanRH_video.client';
import { useUser } from "@auth0/nextjs-auth0/client";
import LogoutButton from '../components/Logout';
import LoginButton from '../components/LoginButton';

export default function Scrapping() {
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
      }, 200);
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
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
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
            <li><LogoutButton /></li>
          ) : (
            <li><LoginButton/></li>
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
                Etudiez vos données marques employeurs grâce à SUPERIA
              </h1>
              <p className="text-center py-2.5 mx-40 px-64">
                Notre outil ScanRH scrute votre site carrière pour en extraire des données précieuses,
                vous offrant ainsi une vision claire de votre image de marque employeur et de la manière
                dont elle est perçue par les candidats potentiels.
              </p>
              <div className="mx-auto py-14 cursor-pointer"><ImageScanRH /></div>
              <div className="mx-auto">
                <ChatbotForm />
              </div>
              <h4 className="text-center py-5">Testez notre outil avec un des sites déjà analysé</h4>
              <div className="mx-auto text-sm grid grid-cols-6 gap-4">
                <div className="col-start-1 col-end-3"><BPIFranceForm /> <LaPosteForm /></div>
                <div className="col-start-3 col-end-5"><AXAForm /> <DecathlonForm /></div>
                <div className="col-start-5 col-end-7"><OrangeForm /> <GeneraliForm /></div>
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
