import React from "react";
import WebLayout from "../layouts/WebLayout";

// components 
const Dashboard = () => {
  return (
    <WebLayout>
      <div className="flex justify-center  text-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div> 
      <div class="flex justify-center py-5 items-center grid-cols-5 gap-6">
        <div class="bg-red-300 p-4">1</div>
        <div class="bg-green-300 p-4">2</div>
        <div class="bg-blue-300 p-4">3</div>
        <div class="bg-red-300 p-4">4</div> 
      </div> 



    </WebLayout>
  );
}

export default Dashboard;