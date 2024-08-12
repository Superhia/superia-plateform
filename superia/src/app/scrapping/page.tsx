import Image from "next/image";
import Link from "next/link";
import ScrappingForm  from './scrappingForm.client';
import ChatbotForm from "../chatbot/ChatbotForm.client";
import BPIFranceForm  from './BPIFranceForm.client';
import AXAForm  from './AXAForm.client';
import OrangeForm  from './OrangeForm.client';
import LaPosteForm  from './LaPosteForm.client';
import DecathlonForm  from './DecathlonForm.client';
import GeneraliForm  from './GeneraliForm.client';
import ImageScanRH from '../components/ScanRH_video.client'

export default function Scrapping() {
  return (
    <main className="flex text-black min-h-screen flex-col items-left p-14 bg-white">
      <Link href={"/"}>
      <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <nav className="flex justify-end">
		<ul className="flex space-x-5 mx-auto -mt-5 mr-4" id="menu">
			<li><Link href={"scrapping"}>ScanRH</Link></li>
			<li><Link href={"parsing"}>DocuParse</Link></li>
			<li><Link href={"chatpdf"}>YoutubeScan</Link></li>
	  </ul>
		</nav>
    <h1 className="text-4xl font-semibold text-center py-7">Etudiez vos données marques employeurs grace à SUPERIA</h1>
          <p className="text-center py-2.5 mx-40 px-64">Notre outil ScanRH scrute votre site carrière pour en extraire des données précieuses, vous offrant ainsi une vision claire de votre image de marque employeur et de la manière dont elle est perçue par les candidats potentiels.</p>
       <div className="mx-auto py-14 cursor-pointer"><ImageScanRH/></div>
        <div className="mx-auto ">
        <ChatbotForm />
      </div>
      <h4>Testez notre outil avec un des sites déjà analysé</h4>
      <div className="mx-auto text-sm grid grid-cols-6 gap-4">
        <div className="col-start-1 col-end-3"><BPIFranceForm/> <LaPosteForm/></div> <div className="col-start-3 col-end-5"><AXAForm/> <DecathlonForm/></div> <div className="col-start-5 col-end-7"><OrangeForm/> <GeneraliForm/></div>
    </div>
    </main>
  );
}
