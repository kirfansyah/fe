import React from "react";

// components

import CardLineChart from "components/Cards/CardLineChart.js";
import CardBarChart from "components/Cards/CardBarChart.js";
import CardPageVisits from "components/Cards/CardPageVisits.js";
import CardSocialTraffic from "components/Cards/CardSocialTraffic.js";

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
