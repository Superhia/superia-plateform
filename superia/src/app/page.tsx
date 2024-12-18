'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client'; // Assuming you use auth0's client-side hook
import AgentForm from './chatbot/AgentForm.client';
import LogoutButton from './components/Logout';
import LoginButton from './components/LoginButton';
import AgentO1mini from './components/O1-mini.client';

export default function Home() {
  const { user, error, isLoading } = useUser(); // Use client-side session hook
  const [userName, setUserName] = useState<string>('');
  const [userSurname, setUserSurname] = useState<string>('');

  // Check for user session
  useEffect(() => {
    if (user) {
      // Explicitly check and provide fallback for strings
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
                  <Link href="analysis">Sentiment</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100">
                  <Link href="offreemploi">Offre Emploi</Link>
                </li>
              </ul>
            )}
          </li>
          {user && (
            <>
              <LogoutButton />
            </>
          )}
          {!user && (
            <>
              <LoginButton/>
            </>
          )}
        </ul>
      </nav>
    );
  };

  return (
    <main className="flex text-black min-h-screen flex-col h-screen items-left p-14 bg-white">
      <Link href={'/'}>
        <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <Navbar isLoggedIn={!!user} />
      <div className="mx-auto">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error loading session</div>
        ) : (
          <>
            {user ? (
              <>
                <div>
                  <h1 className="text-4xl font-semibold text-center py-7">
                    Bienvenue {userSurname} {userName}, dans votre espace personnel Superia!
                  </h1>
                  <p className="text-xl text-center py-2.5 mx-40 px-64">
                    Découvrez Superia, la première plateforme pour la Marque Employeur utilisant l’IA générative
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-10 my-10">
                  <div className="text-center">
                    <Link href={'scrapping'}>
                      <img
                        src="ScanRH.JPG"
                        alt="ScanRH"
                        className="scanrh-image w-64 mx-auto"
                      />
                    </Link>
                    <p className="mt-4">
                      Analysez votre site carrières en 1 clic et découvrez les recommandations de l’IA
                    </p>
                  </div>
                  <div className="text-center">
                    <Link href={'parsing'}>
                      <img
                        src="Docuparse.JPG"
                        alt="Docuparse"
                        className="scanrh-image w-64 mx-auto"
                      />
                    </Link>
                    <p className="mt-4">
                      Scannez vos documents RH et interagissez avec eux de manière fluide
                    </p>
                  </div>
                  <div className="text-center">
                    <Link href={'analysis'}>
                      <img
                        src="Sentiment.webp"
                        alt="Sentiment"
                        className="scanrh-image w-64 mx-auto"
                      />
                    </Link>
                    <p className="mt-4">
                    Notre technologie vous offre une vision claire de ce que vos équipes ressentent.
                    </p>
                  </div>
                  <div className="text-center">
                    <Link href={'offreemploi'}>
                      <img
                        src="Sentiment.webp"
                        alt="Offre Emploi"
                        className="scanrh-image w-64 mx-auto"
                      />
                    </Link>
                    <p className="mt-4">
                    Générez des offres d'emploi simplement et personnalisez-les
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center py-7 mx-auto">
                  <h2 className="text-2xl font-semibold text-center py-5">Converser avec notre agent !</h2>
                  <AgentO1mini/>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-14 mx-auto">
                <h1 className="text-4xl font-semibold text-center py-7">Découvrez Superia,</h1>
                <p className="text-xl text-center py-2.5 mx-40 px-64">
                  Découvrez Superia, la première plateforme pour la Marque Employeur utilisant l’IA générative
                </p>
                <h2 className="text-2xl font-semibold text-center py-5">Conversez avec notre agent !</h2>
                <div>
                <AgentO1mini/>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
