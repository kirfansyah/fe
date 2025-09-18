import React from "react";

// components
// layout for page

import Admin from "layouts/Admin.js";

export default function Dashboard() {
  
  return (
    <div className="mt-6 ml-2 grid grid-cols-1 gap-6">
      {/* Notifikasi */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-2">Notification</h2>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Rury Ilenia menyelesaikan course Teknik Dasar Pengelasan</li>
          <li>• Adit Donarich sertifikat HACCP akan expire 20-11-2025</li>
        </ul>
      </div>

      {/* Training Schedule */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-2">Training Scheduled</h2>
        <p className="text-blue-600 font-medium">27-10-2025 Sertifikasi Halal</p>
      </div>

      {/* Courses List */}
      <div className="bg-white p-4 rounded-lg shadow col-span-2">
        <h2 className="font-semibold mb-2">Courses List</h2>
        <ul className="space-y-2 text-sm">
          <li>Pengenalan Lingkungan Kerja - 423 Enrolled</li>
          <li>Keselamatan Kerja Tingkat Dasar - 226 Enrolled</li>
        </ul>
      </div>

      {/* Calendar */}
      <div className="bg-white p-4 rounded-lg shadow col-span-2">
        <h2 className="font-semibold mb-2">Calendar</h2>
        <p>[Calendar Component Placeholder]</p>
      </div>
    </div>
  );
}

Dashboard.layout = Admin;
