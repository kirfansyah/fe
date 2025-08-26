import React from "react";

import Navbar from "components/Navbars/AuthNavbar.js";
import FooterSmall from "components/Footers/FooterSmall.js";
import Image from "next/image";

export default function Auth({ children }) {
  return (
    <>
  <Navbar transparent />
  <main>
    <section className="relative w-full h-full min-h-screen py-20">
      {/* Background image */}
      <Image
        src="/img/background.jpg"
        alt="Background"
        width={1920}
        height={100}
        priority
        className="absolute inset-0 w-full h-[100vh] object-cover object-center opacity-50"
      />

      {/* Konten di atas background */}
      <div className="relative flex z-10 items-center justify-center pb-20">
        <h1 className="text-3xl font-bold ">SAMBU GROUP</h1>
      </div>

      {children}
      <FooterSmall absolute />
    </section>
  </main>
</>


  );
}
