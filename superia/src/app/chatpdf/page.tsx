import Image from "next/image";
import Link from "next/link";
import ChatPDFForm  from "./ChatPDFForm.client";
import Question from "./Question.client";
import Ebook from "./EbookForm.client"
import LBAmbassadeur from "./LBAmbassadeurForm.client"
import LBMarketing from "./LBMarketingForm.client"
import LSiteCarriere from "./LSiteCarrièreForm.client"

export default function Chatpdf() {
    async function createInvoice(formData: FormData) {
        'use server'
   
   const rawFormData = {
     customerId: formData.get('customerId'),
     amount: formData.get('amount'),
     status: formData.get('status'),
   }
}
  return (
    <main className="flex min-h-screen flex-col items-left p-14 bg-white">
      <Link href={"/"}>
      <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <nav className="flex">
		<ul className="flex space-x-5 mx-auto -mt-5" id="menu">
			<li><Link href={"scrapping"}>ScanRH</Link></li>
			<li><Link href={"parsing"}>DocuParse</Link></li>
			<li><Link href={"chatpdf"}>ChatDoc</Link></li>
	  </ul>
		</nav>
    <h1 className="text-4xl font-semibold text-center py-7">Chargez votre document</h1>
    <p className="text-center mx-32 px-32">Unique en son genre, notre fonctionnalité de dialogue avec des PDFs professionnels permet une interaction directe avec vos documents. Posez des questions, obtenez des résumés et discutez avec le contenu de vos PDFs comme jamais auparavant.</p>
      <div className=" items-center mx-auto py-14">
  <ChatPDFForm/>
      </div>
      <h4>Testez notre outil avec un des PDF déjà chargé</h4>
      <div className="mx-auto text-sm grid grid-cols-4 gap-4">
        <div><Ebook/></div> <div><LBAmbassadeur/></div> <div><LBMarketing/></div> <div><LSiteCarriere/></div>
   </div>
    </main>
  );
}