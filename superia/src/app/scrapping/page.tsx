import Image from "next/image";
import Link from "next/link";
import ScrappingForm  from './scrappingForm.client';
import BPIFranceForm  from './BPIFranceForm.client';
import AXAForm  from './AXAForm.client';
import OrangeForm  from './OrangeForm.client';
import LaPosteForm  from './LaPosteForm.client';
import DecathlonForm  from './DecathlonForm.client';
import GeneraliForm  from './GeneraliForm.client';
import Chatbot from '../chatbot/ChatbotForm.client';

export default function Scrapping() {
  return (
    <main className="flex text-black min-h-screen flex-col items-left p-14 bg-white">
      <Link href={"/"}>
      <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <nav className="flex">
		<ul className="flex space-x-5 mx-auto -mt-5" id="menu">
			<li><Link href={"scrapping"}>ScanRH</Link></li>
			<li><Link href={"parsing"}>DocuParse</Link></li>
			<li><Link href={"chatpdf"}>YoutubeScan</Link></li>
	  </ul>
		</nav>
    <h1 className="text-4xl font-semibold text-center py-7">Etudie tes données marques employeurs grace à SUPERIA</h1>
          <p className="text-center py-2.5 mx-32 px-32">Notre outil ScanRH scrute votre site carrière pour en extraire des données précieuses, vous offrant ainsi une vision claire de votre image de marque employeur et de la manière dont elle est perçue par les candidats potentiels.</p>
        <div className="mx-auto py-14">
        <ScrappingForm />
      </div>
      <h4>Testez notre outil avec un des sites déjà analysé</h4>
      <div className="mx-auto text-sm grid grid-cols-6 gap-4">
        <div className="col-start-1 col-end-3"><BPIFranceForm/> <LaPosteForm/></div> <div className="col-start-3 col-end-5"><AXAForm/> <DecathlonForm/></div> <div className="col-start-5 col-end-7"><OrangeForm/> <GeneraliForm/></div>
    </div>
   <div className="mx-auto text-2xl">
   <button className="p-5 pl-20 pr-20 m-10 rounded-md border-0  text-blue-900 ring-1 ring-inset ring-blue-300 2xl:text-2xl 2xl:leading-8"><Link href={"chatbot"}>Pose tes questions à ton site web</Link></button>
   </div>
    </main>
  );
}
