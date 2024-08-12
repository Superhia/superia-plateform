import AdminRegister from '../components/AdminRegister';
import UserList from '../components/UserList';
import Link from "next/link";

export default function Home() {
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
    <div>
      <h1 className="text-4xl font-semibold text-center py-7">Bienvenue dans votre system de management</h1>
      <UserList />
    </div>
    <div>
      <h2 className='text-2xl font-semibold py-7'>Créez votre administrateur</h2>
      <AdminRegister/></div>
    </main>
  );
}