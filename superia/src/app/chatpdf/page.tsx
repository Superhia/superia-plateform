import Image from "next/image";
import Link from "next/link";
import ChatPDFForm  from "./ChatPDFForm.client";
import Question from "./Question.client";

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
    <main className="flex min-h-screen flex-col items-left p-14">
      <nav className="flex mx-auto">
		<ul className="flex space-x-5" id="menu">
		  <li><Link href={"/"}>Home</Link></li>
			<li><Link href={"scrapping"}>Scrapping</Link></li>
			<li><Link href={"parsing"}>Parsing</Link></li>
			<li><Link href={"chatpdf"}>ChatPdf</Link></li>
	  </ul>
		</nav>
      <div className=" items-center justify-between font-mono text-sm lg:flex m-auto">
  <ChatPDFForm/>
      </div>
    </main>
  );
}