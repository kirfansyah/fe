import React from "react";
import Link from "next/link";

export default function Footer(props) {
  return (
    <>
      <footer
        className={
          (props.absolute
            ? "absolute w-full bottom-0 bg-white"
            : "relative") + " pb-6"
        }
      >
        <div className=" mx-auto w-full">
          <hr className="mb-6 border-b-1 border-gray-200" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full px-4">
              <div className="text-sm text-blueGray-500 font-semibold py-1 text-center">
                Copyright © {new Date().getFullYear()}{" "} Sambu Group
              </div>
            </div>
            
          </div>
        </div>
      </footer>
    </>
  );
}
