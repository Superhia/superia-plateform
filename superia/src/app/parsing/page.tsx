'use client';
import Link from 'next/link';
import { useState } from 'react';
import Ebook from './EbookComponent.client';
import LBAmbassadeur from './LBAmbassadeurComponent.client';
import LBMarketing from './LBMarketingComponent.client';
import LSiteCarriere from './LSiteCarriereComponent.client';
import FileUploadComponent from './UploadComponent.client';

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
      <nav className="flex w-full justify-center">
        <ul className="flex space-x-5 -mt-5" id="menu">
          <li><Link href="scrapping">ScanRH</Link></li>
          <li><Link href="parsing">DocuParse</Link></li>
          <li><Link href="chatpdf">YoutubeScan</Link></li>
        </ul>
      </nav>
      <h1 className="text-4xl font-semibold text-center py-7">Pose des questions à ton Fichier</h1>
      <p className="text-center mx-32 px-32">Superia simplifie la gestion documentaire grâce à son outil de parsing intelligent, capable de traiter et d’organiser efficacement tous types de documents, vous permettant de gagner du temps et d’améliorer votre efficacité opérationnelle.</p>
      <div className="flex justify-center py-14 bg-white" onClick={handleFileUploadClick}>
        <FileUploadComponent />
      </div>
      {!fileUploadClicked && (
        <>
          <h4 className="text-center">Testez notre outil avec un des PDF déjà chargé</h4>
          <div className="flex justify-center space-x-8 py-14 bg-white">
            {activeButton === null ? (
              <>
                <div onClick={() => handleButtonClick('Ebook')} className="cursor-pointer">
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



