import { useState, useCallback } from "react";
import Admin from "layouts/Admin.js";
import EbookListView from "../../components/Library/EbookList";
import MonitoringView from "../../components/Library/Monitoring";
import ContentAdditionView from "../../components/Course/AddContent";
import ContentViewEbook from "../../components/Library/ViewEbook";
import { useEbooks } from "../../hooks/useEbooks";

export default function Management() {
  const [activeTab, setActiveTab] = useState("ebooks-list");
  const [currentPage, setCurrentPage] = useState("main");
  const [selectedEbookId, setSelectedEbookId] = useState("");
  const {
    ebooks,
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

  const MainPage = () => (
    <div className="mt-6 ml-2 grid grid-cols-1 gap-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("ebooks-list")}
            className={`px-12 py-2 font-medium text-sm rounded-t border-b-0 ${
              activeTab === "ebooks-list"
                ? "bg-blue-900 text-white"
                : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
            }`}
          >
            eBook List
          </button>
          <button
            onClick={() => setActiveTab("monitoring")}
            className={`px-12 py-2 font-medium text-sm rounded-t border-b-0 ${
              activeTab === "monitoring"
                ? "bg-blue-900 text-white"
                : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
            }`}
          >
            Monitoring
          </button>
        </div>
      </div>
      {/* Content Section */}
      <div>
        {activeTab === "ebooks-list" && (
          <EbookListView
            ebooks={ebooks}
            categorys={categorys}
            subCategorys={subCategorys}
            onAddContent={handleAddContent}
            onViewContent={handleViewEbook}
            onSave={handleSaveEbook}
            onUpdate={handleUpdateEbook}
            onDelete={handleDeleteEbook}
          />
        )}
        {activeTab === "monitoring" && <MonitoringView employees={employees} />}
      </div>
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
      categorys={categorys}
    />
  );

  return (
    <div>
      {currentPage === "main" && <MainPage />}
      {currentPage === "addContent" && <AddContentPage />}
      {currentPage === "ViewEbook" && <ViewContentEbook />}
    </div>
  );
}
Management.layout = Admin;
