import React from "react";
import Sidebar from "../components/Sidebars/Sidebar";
import Footer from "../components/Footers/Footer.js";
import Header from "../components/Headers/Header.js";

export default function Admin({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ✅ Header - Fixed at top */}
      <Header />

      {/* ✅ Main Layout Container */}
      <div className="flex flex-1 mt-[72px] lg:mt-[80px]">
        {/* ✅ Sidebar - Responsive */}
        <Sidebar />

        {/* ✅ Content Area */}
        <main className="flex-1 overflow-auto">
          {/* Content wrapper with breadcrumb */}
          <div className="p-4  lg:pt-24 lg:px-8">
            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>

      {/* ✅ Footer */}
      <Footer />
    </div>
  );
}