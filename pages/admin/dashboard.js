import React from "react";

// components
// layout for page

import Admin from "layouts/Admin.js";

export default function Dashboard() {
  return (
    <Admin>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Isi konten dashboard di sini.</p>
    </Admin>
  );
}

Dashboard.layout = Admin;
