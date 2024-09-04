'use client';
import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Logout from "./components/Logout";
import AgentForm from "./chatbot/AgentForm.client";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userSurname, setUserSurname] = useState('');
  const [loading, setLoading] = useState(true);

  // Custom hook to validate session
  function useSessionValidation() {
    useEffect(() => {
      const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
      const storedUserName = localStorage.getItem('userName');
      const storedUserSurname = localStorage.getItem('userSurname');

      // Validate session if session data is found in localStorage
      if (storedIsLoggedIn && storedUserName && storedUserSurname) {
        setIsLoggedIn(JSON.parse(storedIsLoggedIn));
        setUserName(storedUserName);
        setUserSurname(storedUserSurname);
        setLoading(false); // End loading if session found in localStorage
      } else {
        // Validate session via API if not found in localStorage
        const validateSession = async () => {
          try {
            const response = await fetch('/api/auth/validate-session');
            const data = await response.json();
            if (data.isLoggedIn) {
              setIsLoggedIn(true);
              setUserName(data.user.name);
              setUserSurname(data.user.surname);
              // Store session in localStorage
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('userName', data.user.name);
              localStorage.setItem('userSurname', data.user.surname);
            } else {
              // Clear localStorage if session is invalid or expired
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('userName');
              localStorage.removeItem('userSurname');
              setIsLoggedIn(false);
            }
          } catch (error) {
            console.error('Error validating session:', error);
            setIsLoggedIn(false);
          } finally {
            setLoading(false); // End loading regardless of success/failure
          }
        };
        validateSession();
      }
    }, []);
  }

  // Call the custom hook to validate session
  useSessionValidation();

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
            <li><Link href="login">Connexion</Link></li>
          )}
        </ul>
      </nav>
    );
  };

  // Handle loading state before displaying content
  if (loading) {
    return <p>Loading session...</p>; // Show loading message
  }

  return (
    <main className="flex text-black min-h-screen flex-col h-screen items-left p-14 bg-white">
      <Link href={"/"}>
        <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <Navbar isLoggedIn={isLoggedIn} />
      <div className="mx-auto">
        {isLoggedIn ? (
          <>
            <div>
              <h1 className="text-4xl font-semibold text-center py-7">
                Bienvenue {userSurname} {userName}, dans votre espace personnel Superia!
              </h1>
              <p className="text-xl text-center py-2.5 mx-40 px-64">
                Découvrez Superia, la première plateforme pour la Marque Employeur utilisant l’IA générative
              </p>
            </div>
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
            <div className='flex flex-col items-center py-7 mx-auto'>
              <h2 className="text-2xl font-semibold text-center py-5">Converser avec notre agent ! </h2>
              <AgentForm />
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center py-14 mx-auto'>
            <h1 className="text-4xl font-semibold text-center py-7">Découvrez Superia,</h1>
            <p className="text-xl text-center py-2.5 mx-40 px-64">
              Découvrez Superia, la première plateforme pour la Marque Employeur utilisant l’IA générative
            </p>
            <h2 className="text-2xl font-semibold text-center py-5">Conversez avec notre agent ! </h2>
            <div><AgentForm /></div>
          </div>
        )}
      </div>
    </main>
  );
}
