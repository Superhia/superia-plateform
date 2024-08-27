'use client'
import Login from '../components/login/Login';
import Register from '../components/register/Register';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import Logout from "../components/Logout";


const LoginPage = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Extract the URL search parameters directly from the window location
    const searchParams = new URLSearchParams(window.location.search);
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    // Set messages based on query parameters
    if (success) {
      setMessage(decodeURIComponent(success));
    } else if (error) {
      setMessage(decodeURIComponent(error));
    }
  }, []);
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
      <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <Navbar isLoggedIn={isLoggedIn}/>
    <div>
    <h1 className="text-4xl font-semibold text-center py-7"> Découvrez Superia,</h1>
      <p className="text-xl text-center py-2.5 mx-32 px-32">
      Superia n’est qu’à quelques clics ! Pour accéder aux services proposés par Superia, identifiez-vous ou créez un nouveau compte.
      </p>
      <div className="flex justify-center items-center bg-white">
        <div className="text-center mx-32">
          <h2 className="text-2xl font-semibold py-7">Saisissez votre email et votre mot de passe pour aller sur la plateforme.</h2>
          {message && (
        <div style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>
          {message}
        </div>
      )}
      
          <Login />
          <p>Vous n'avez pas encore de compte ?</p> <button className='text-sky-700'><a href='/register'>Inscription</a></button>
          <p>Vous avez oublié votre mots de passe</p><button className='text-sky-700'><a href='/forgot'>Réinitialiser mon mots de passe</a></button>
        </div>
      </div>
    </div>
    </main>
  );
};

export default LoginPage;