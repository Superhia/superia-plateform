'use client';
import Link from 'next/link';
import { useState, useEffect, useRef} from 'react';
import Ebook from './EbookComponent.client';
import LBAmbassadeur from './LBAmbassadeurComponent.client';
import LBMarketing from './LBMarketingComponent.client';
import LSiteCarriere from './LSiteCarriereComponent.client';
import FileUploadComponent from './UploadComponent.client';
import Parsing_video from '../components/Parsing_video.client';
import Logout from "../components/Logout";

export default function Parsing() {
  const [response, setResponse] = useState<string>('');
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [fileUploadClicked, setFileUploadClicked] = useState<boolean>(false);

  const handleResponse = (res: string) => {
    setResponse(res);
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

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  const handleFileUploadClick = () => {
    setFileUploadClicked(true);
  };

  return (
    <main className="flex flex-col text-black min-h-screen p-14 bg-white">
      <Link href="/">
        <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <Navbar isLoggedIn={isLoggedIn}/>
      <h1 className="text-4xl font-semibold text-center py-7">Posez des questions à votre Fichier</h1>
      <p className="text-center mx-40 px-64">Superia simplifie la gestion documentaire grâce à son outil de parsing intelligent, capable de traiter et d’organiser efficacement tous types de documents, vous permettant de gagner du temps et d’améliorer votre efficacité opérationnelle.</p>
      <div className='flex flex-col items-center py-14 cursor-pointer'><Parsing_video/></div>
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
    </main>
  );
}
