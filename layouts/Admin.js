import React from "react";
import Sidebar from "components/Sidebars/Sidebar";
import Footer from "components/Footers/Footer.js";
import Header from "components/Headers/Header";

export default function Admin({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
       <Header />
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 pt-12 overflow-auto">

        {/* Content */}
        <main className="flex-1 mt-6 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
