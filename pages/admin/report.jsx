import { useState, useCallback } from "react";
import Admin from "layouts/Admin.js";
import OfflineLearningView from "../../components/Report/OfflineLearning";
import OnlineLearningView from "../../components/Report/OnlineLearning";
import { useReport } from "../../hooks/useReport";

export default function Report() {
  const [activeTab, setActiveTab] = useState("online-learning");
  const [currentPage, setCurrentPage] = useState("main");
  const {
    onlineLearning,
    offlineLearning,
    position,
    dept,
    company,
    employee,
    addOfflineLearning,
    updateOfflineLearning,
  } = useReport();

  const handleSaveOfflineLearning = async (offlineLearningData) => {
    try {
      await addOfflineLearning(offlineLearningData);
      alert("certificate created successfully!");
    } catch (error) {
      console.error("Error creating certificate:", error);
    }
  };

  const handleUpdateOfflineLearning = async (id, offlineLearningData) => {
    try {
      await updateOfflineLearning(id, offlineLearningData);
      alert("certificate updated successfully!");
    } catch (error) {
      console.error("Error updating certificate:", error);
    }
  };

  const MainPage = () => (
    <div className="mt-6 ml-2 grid grid-cols-1 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("online-learning")}
            className={`px-12 py-2 font-medium text-sm rounded-t border-b-0 ${
              activeTab === "online-learning"
                ? "bg-blue-900 text-white"
                : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
            }`}
          >
            Online Learning
          </button>
          <button
            onClick={() => setActiveTab("offline-learning")}
            className={`px-12 py-2 font-medium text-sm rounded-t border-b-0 ${
              activeTab === "offline-learning"
                ? "bg-blue-900 text-white"
                : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
            }`}
          >
            Offline Learning
          </button>
        </div>
      </div>
      <div>
        {activeTab === "online-learning" && (
          <OnlineLearningView onlineLearning={onlineLearning} />
        )}
        {activeTab === "offline-learning" && (
          <OfflineLearningView
            offlineLearning={offlineLearning}
            onSave={handleSaveOfflineLearning}
            onUpdate={handleUpdateOfflineLearning}
            position={position}
            dept={dept}
            company={company}
            employee={employee}
          />
        )}
      </div>
    </div>
  );

  return <div>{currentPage === "main" && <MainPage />}</div>;
}

Report.layout = Admin;
