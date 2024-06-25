import Image from "next/image";
import Link from "next/link";
import ChatPDFForm  from "./ChatPDFForm.client";

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
    <h1 className="text-4xl font-semibold text-center py-7">Etudie tes vidéos</h1>
    <p className="text-center mx-40 px-64">Unique en son genre, notre fonctionnalité d analyse de sentiments de vos vidéos youtube permet une interaction directe. Obtenez des résumés et discutez avec le contenu de vos vidéos comme jamais auparavant.</p>
      <div className=" items-center mx-auto py-14 bg-white">
  <ChatPDFForm/>
   </div>
    </main>
  );
}