import React from "react";
import { 
  Bell
} from "lucide-react";
import Image from "next/image";
export default function Header() {
  return (
    <div className="bg-white shadow-sm p-4 flex justify-between items-center fixed w-full z-20">
      <div className="flex items-center space-x-3">
        <Image
          src="/img/logo.png"
          alt="Sambu Group"
          width={200}
          height={200}
          className="mr-1"
        />
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            1
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-gray-800 font-medium">Annisa Karim</span>
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}
