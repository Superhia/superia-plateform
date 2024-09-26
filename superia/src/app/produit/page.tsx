'use client'
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import ScanRH_Video from "../components/ScanRH_video.client"
import Parsing_video from '../components/Parsing_video.client';
import Youtube_video from '../components/Youtube_video.client';
import LogoutButton from "../components/Logout";
import LoginButton from "../components/LoginButton";

export default function Tarif() {
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
      <Link href={"/"}>
        <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <Navbar isLoggedIn={!!user} />
      <h1 className="text-4xl font-semibold text-center py-7"> Nos solutions,</h1>
      <p className="text-center py-2.5 mx-32 px-32">
      </p>
      <div className='flex justify-center space-x-10'>
                    <div className='cursor-pointer m-10'><ScanRH_Video/></div>
                      <div className='cursor-pointer m-10'><Parsing_video/></div>
                     <div className='cursor-pointer m-10'><Youtube_video/></div>
                     </div>
    </main>
  );
}
