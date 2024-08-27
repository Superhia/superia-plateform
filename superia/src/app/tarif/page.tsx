'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Logout from "../components/Logout";

export default function Tarif() {
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
        }
        console.log('Logged In Status:', data.isLoggedIn);
      } catch (error) {
        console.error('Error validating session:', error);
        setIsLoggedIn(false);
      }
    };

    validateSession();
  }, []);

  // Navbar component within the same file
  interface NavbarProps {
    isLoggedIn: boolean;
  }
  
  const Navbar: React.FC<NavbarProps> = ({ isLoggedIn }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
    const handleMouseEnter = () => {
      setIsDropdownOpen(true);
    };
  
    const handleMouseLeave = () => {
      setIsDropdownOpen(false);
    };

    return (
      <nav className="flex justify-end">
      <ul className="flex space-x-5 -mt-5 mr-4" id="menu">
        <li
          className="relative cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link href="produit">Produit</Link>
          {isDropdownOpen && (
            <ul
              className="absolute left-0 mt-2 w-48 bg-white shadow-lg border rounded-md"
              onMouseEnter={() => setIsDropdownOpen(true)}
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
    <main className="flex text-black min-h-screen flex-col h-screen items-left p-14 bg-white">
      <Link href={"/"}>
        <img src="/LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>

      {/* Render Navbar */}
      <Navbar isLoggedIn={isLoggedIn} />

      <h1 className="text-4xl font-semibold text-center py-7">Tarif</h1>
      <p className="text-center py-2.5 mx-32 px-32">
        {/* Your content goes here */}
      </p>
    </main>
  );
}
