'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Ebook from './EbookComponent.client';
import LBAmbassadeur from './LBAmbassadeurComponent.client';
import LBMarketing from './LBMarketingComponent.client';
import LSiteCarriere from './LSiteCarriereComponent.client';
import FileUploadComponent from './UploadComponent.client';
import Parsing_video from '../components/Parsing_video.client';
import LogoutButton from '../components/Logout';
import { useUser } from '@auth0/nextjs-auth0/client';
import LoginButton from '../components/LoginButton';

export default function Parsing() {
  const { user, error, isLoading } = useUser(); // Use client-side session hook
  const [userName, setUserName] = useState<string>('');
  const [userSurname, setUserSurname] = useState<string>('');
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [fileUploadClicked, setFileUploadClicked] = useState<boolean>(false);

  // Check for user session
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
            <div className="flex items-center">
              Produit
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

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  const handleFileUploadClick = () => {
    setFileUploadClicked(true);
  };

  const renderComponent = () => {
    switch (activeButton) {
      case 'Ebook':
        return <Ebook />;
      case 'LBAmbassadeur':
        return <LBAmbassadeur />;
      case 'LBMarketing':
        return <LBMarketing />;
      case 'LSiteCarriere':
        return <LSiteCarriere />;
      default:
        return null;
    }
  };

  return (
    <main className="flex flex-col text-black min-h-screen p-14 bg-white">
      <Link href="/">
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
                Posez des questions à votre fichier
              </h1>
              <p className="text-center mx-40 px-64">
                Superia simplifie la gestion documentaire grâce à son outil de parsing intelligent, capable de traiter et d’organiser efficacement tous types de documents, vous permettant de gagner du temps et d’améliorer votre efficacité opérationnelle.
              </p>
              <div className="flex flex-col items-center py-14 cursor-pointer"><Parsing_video /></div>
              <div className="flex justify-center py-14" onClick={handleFileUploadClick}>
                <FileUploadComponent />
              </div>
              {!fileUploadClicked && (
                <>
                  <h4 className="text-center">Testez notre outil avec un des PDF déjà chargé</h4>
                  <div className="flex justify-center space-x-8 py-14">
                    {activeButton === null ? (
                      <>
                        <div onClick={() => handleButtonClick('Ebook')} className="cursor-pointer bg-white">
                          <Ebook />
                        </div>
                        <div onClick={() => handleButtonClick('LBAmbassadeur')} className="cursor-pointer">
                          <LBAmbassadeur />
                        </div>
                        <div onClick={() => handleButtonClick('LBMarketing')} className="cursor-pointer">
                          <LBMarketing />
                        </div>
                        <div onClick={() => handleButtonClick('LSiteCarriere')} className="cursor-pointer">
                          <LSiteCarriere />
                        </div>
                      </>
                    ) : (
                      renderComponent()
                    )}
                  </div>
                </>
              )}
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
