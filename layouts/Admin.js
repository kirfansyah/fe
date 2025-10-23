import React from "react";
import Sidebar from "../components/Sidebars/Sidebar";
import Footer from "../components/Footers/Footer.js";
import Header from "../components/Headers/Header.js";

export default function Admin({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Main Content */}
      <div className="flex pt-24 overflow-auto">
        <Sidebar />
        {/* Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
