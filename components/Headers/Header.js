import React from "react";
export default function HeaderStats() {
  return (
    <>
    <div className=" mx-auto w-full">
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full px-4">
              <div className="text-sm text-blueGray-500 font-semibold py-1 text-center">
                Copyright © {new Date().getFullYear()}{" "} PT Pulau Sambu
              </div>
            </div>
            
          </div>
          <hr className="mb-6 border-b-1 border-gray-200" />
        </div>
    </>   
  );
}