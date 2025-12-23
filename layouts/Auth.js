import React from "react";
import Footer from "components/Footers/Footer.js";
import Image from "next/image";

export default function Auth({ children }) {
  return (
    <>
      <main className="fixed inset-0 w-full h-full overflow-hidden">
        <section className="relative w-full h-full flex flex-col">
          {/* ✅ Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="relative min-h-full flex flex-col items-center justify-center py-20">
              {/* Background image (di belakang children) */}
              <div className="absolute top-1/2 left-0 right-0 flex justify-center z-0 -translate-y-1/2">
                <Image
                  src="/img/background.jpg"
                  alt="Background"
                  width={1080}
                  height={720}
                  priority
                  className="opacity-30"
                />
              </div>

              {/* Konten */}
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="flex items-center justify-center pb-12">
                  <Image
                    src="/img/logo.png"
                    alt="Sambu Group"
                    width={250}
                    height={250}
                    className="mr-1"
                  />
                </div>

                {children}
              </div>
            </div>
          </div>

          {/* ✅ Footer - Always at bottom */}
          <Footer absolute />
        </section>
      </main>
    </>
  );
}