import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <body>
    <main className="flex min-h-screen flex-col items-left p-14">
      <nav className="flex mx-auto">
		<ul className="flex space-x-5" id="menu">
		  <li><Link href={"/"}>Home</Link></li>
			<li><Link href={"scrapping"}>Scrapping</Link></li>
			<li><Link href={"parsing"}>Parsing</Link></li>
			<li><Link href={"chatpdf"}>ChatPdf</Link></li>
	  </ul>
		</nav>
    </main>
    </body>
  );
}

