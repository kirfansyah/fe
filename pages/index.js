/* eslint-disable react/jsx-no-target-blank */
import React from "react"; 
import Footer from "components/Footers/Footer";
import Header from "components/Headers/Header";

export default function Index() {
  return (
    <>  
    <Header />
      <section className="pb-16 relative pt-32">
        <div
          className="-mt-20 top-0 bottom-auto left-0"
          style={{ transform: "translateZ(0)" }}
        >
           <h1 className="text-center">
            Selamat Datang di Learning Management System (LMS) SAMBU GROUP
           </h1>
        </div>
 
      </section>
       <Footer />
    </>
  );
}
