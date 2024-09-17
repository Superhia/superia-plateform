import Link from "next/link";
import LogoutButton from "../components/Logout";
import { useState, useRef } from 'react';
import { getSession } from "@auth0/nextjs-auth0";

export default async function NavBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use server-side getSession to get user information
  const session = await getSession();
  const user = session?.user;

  // Handle mouse enter and open the dropdown
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  // Handle mouse leave and close the dropdown with a delay
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  return (
    <nav className="flex justify-end">
      <ul className="flex space-x-5 -mt-5 mr-4" id="menu">
        <li className="px-4 py-2 hover:bg-gray-100">
          <Link href="produit">Produit</Link>
</li>
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

        {/* User-based navigation links */}
        {user ? (
          <>
            <LogoutButton />
          </>
        ) : (
          <>
            <li>
              <Link href="/api/auth/signup">Inscription</Link>
            </li>
            <li>
              <Link href="/api/auth/login">Connexion</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
