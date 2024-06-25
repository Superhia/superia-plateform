'use client';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Tarif() {
  
  return (
    <main className="flex text-black min-h-screen flex-col h-screen items-left p-14 bg-white">
      <Link href={"/"}>
        <img src="LaSuperAgence.png" alt="icon" className="h-8" />
      </Link>
      <nav className="flex justify-end">
        <ul className="flex space-x-5 -mt-5 mr-4" id="menu">
          <li><Link href={"scrapping"}>Tarif</Link></li>
          <li><Link href={"https://lasuperagence.com"}>Blog</Link></li>
          <li><Link href={"login"}>Conection</Link></li>
        </ul>
      </nav>
      <h1 className="text-4xl font-semibold text-center py-7"> Tarif,</h1>
      <p className="text-center py-2.5 mx-32 px-32">
        
      </p>
    </main>
  );
}
