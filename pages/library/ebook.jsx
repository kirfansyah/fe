import { useState, useCallback } from "react";
import Admin from "layouts/Admin.js";
import EbookListView from "../../components/Library/EbookList";
import MonitoringView from "../../components/Library/Monitoring";
import ContentAdditionView from "../../components/Course/AddContent";
import ContentViewEbook from "../../components/Library/ViewEbook";
import { useEbooks } from "../../hooks/useEbooks";
import { BookOpen, BarChart3 } from "lucide-react";

export default function Management() {
  const [activeTab, setActiveTab] = useState("ebooks-list");
  const [currentPage, setCurrentPage] = useState("main");
  const [selectedEbookId, setSelectedEbookId] = useState("");
  const {
    ebooks,
    companys,
    categorys,
    subCategorys,
    employees,
    addEbook,
    updateEbook,
    deleteEbook,
  } = useEbooks();

  const handleViewEbook = (ebookId) => {
    setSelectedEbookId(ebookId);
    setCurrentPage("ViewEbook");
  };

  const handleAddContent = (ebookId) => {
    setSelectedEbookId(ebookId);
    setCurrentPage("addContent");
  };

  const handleSaveEbook = async (ebookData) => {
    try {
      await addEbook(ebookData);
      alert("eBook created successfully!");
    } catch (error) {
      console.error("Error creating ebook:", error);
    }
  };

  const handleUpdateEbook = async (id, ebookData) => {
    try {
      await updateEbook(id, ebookData);
      alert("eBook updated successfully!");
    } catch (error) {
      console.error("Error updating ebook:", error);
    }
  };

  const handleDeleteEbook = async (id) => {
    try {
      await deleteEbook(id);
      alert("eBook deleted successfully!");
    } catch (error) {
      console.error("Error deleting ebook:", error);
    }
  };

  const tabs = [
    {
      id: "ebooks-list",
      label: "eBook List",
      icon: BookOpen,
    },
    {
      id: "monitoring",
      label: "Monitoring",
      icon: BarChart3,
    },
  ];

  const MainPage = () => (
    <div className="mt-4 sm:mt-6 mx-2 sm:mx-4 lg:mx-6">
      {/* Modern Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab Header */}
        <div className="border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-0">
            {/* Tab Buttons - Mobile: Full width stacked, Desktop: Inline */}
            <div className="flex flex-col sm:flex-row w-full sm:w-auto">
              {/* Mobile View - Full Width Buttons */}
              <div className="flex sm:hidden w-full gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-3 
                        text-sm font-medium rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
                      `}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-white" : "text-gray-400"
                        }`}
                      />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Desktop View - Tab Style */}
              <div className="hidden sm:flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        relative flex items-center gap-2.5 px-6 lg:px-8 py-4 lg:py-5
                        text-sm lg:text-base font-medium transition-all duration-200
                        ${
                          isActive
                            ? "text-blue-600"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <Icon
                        className={`w-4 h-4 lg:w-5 lg:h-5 transition-colors ${
                          isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      <span>{tab.label}</span>

                      {/* Active Indicator */}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional: Right side content area for future use */}
            <div className="hidden sm:block sm:pr-4">
              {/* Placeholder for additional header content */}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-0">
          {/* Animated Content Wrapper */}
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === "ebooks-list" && (
              <div className="animate-fadeIn">
                <EbookListView
                  ebooks={ebooks}
                  companys={companys}
                  categorys={categorys}
                  subCategorys={subCategorys}
                  onAddContent={handleAddContent}
                  onViewContent={handleViewEbook}
                  onSave={handleSaveEbook}
                  onUpdate={handleUpdateEbook}
                  onDelete={handleDeleteEbook}
                />
              </div>
            )}
            {activeTab === "monitoring" && (
              <div className="animate-fadeIn">
                <MonitoringView employees={employees} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );

  const ViewContentEbook = () => (
    <ContentViewEbook
      onBack={() => setCurrentPage("main")}
      ebookId={selectedEbookId}
    />
  );

  const AddContentPage = () => (
    <ContentAdditionView
      onBack={() => setCurrentPage("main")}
      companys={companys}
      categorys={categorys}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {currentPage === "main" && <MainPage />}
      {currentPage === "addContent" && <AddContentPage />}
      {currentPage === "ViewEbook" && <ViewContentEbook />}
    </div>
  );
}
Management.layout = Admin;
