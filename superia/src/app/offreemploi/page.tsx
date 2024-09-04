"use client"
import Image from "next/image";
import Link from "next/link";
import Offre_Emploi from "./OffreEmploiForm.client";
import {useState, useEffect, useRef} from "react";
import Logout from "../components/Logout";

export default function Sentimentpage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userSurname, setUserSurname] = useState('');
  const [loading, setLoading] = useState(true); // Add a loading state

  // Custom hook to validate session and use localStorage
  const useSessionValidation = () => {
    useEffect(() => {
      const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
      const storedUserName = localStorage.getItem('userName');
      const storedUserSurname = localStorage.getItem('userSurname');

      if (storedIsLoggedIn && storedUserName && storedUserSurname) {
        setIsLoggedIn(JSON.parse(storedIsLoggedIn));
        setUserName(storedUserName);
        setUserSurname(storedUserSurname);
        setLoading(false); // Session found in localStorage, no need to fetch
      } else {
        const validateSession = async () => {
          try {
            const response = await fetch('/api/auth/validate-session');
            const data = await response.json();
            if (data.isLoggedIn) {
              setIsLoggedIn(true);
              setUserName(data.user.name);
              setUserSurname(data.user.surname);
              localStorage.setItem('isLoggedIn', JSON.stringify(data.isLoggedIn));
              localStorage.setItem('userName', data.user.name);
              localStorage.setItem('userSurname', data.user.surname);
            } else {
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
  };

  // Call the session validation hook
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
  return (
    
    <main className="flex text-black min-h-screen flex-col items-left p-14 bg-white">
      <Link href={"/"}>
      <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <Navbar isLoggedIn={isLoggedIn}/>
    <h1 className="text-4xl font-semibold text-center py-7">Génération d'offres d'emploi sur mesure</h1>
    <p className="text-center py-2.5 mx-32 px-32">Avec SuperIA, générer des offres d'emploi simplement et personnalisé les à votre convenance.</p>
    <div className="mx-auto py-14 bg-white"><Offre_Emploi/></div>
    </main>
    
  );
}