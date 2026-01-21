import { useState, useCallback } from "react";
import CourseLayout from "@/layouts/CourseLayout";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, Star, FileText, Video, Lock } from "lucide-react";

import EbookListView from "../components/Library/EbookEmployee";
import EbookEmployeeView from "../components/Library/EbookEmployee";
// import ContentViewEbook from "../components/Library/ViewEbook";
import { useEbooks } from "../hooks/useEbooks";
import { useMenuPermissions } from "@/hooks/useMenuPermissions"; // ✅ Import

export default function Library() {
  const permissions = useMenuPermissions();
  const [activeTab, setActiveTab] = useState("monitoring");
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
    <div className="mt-2 ml-2 grid grid-cols-1 gap-6">
      {/* Content Section */}
      <div>
        {activeTab === "monitoring" && <EbookEmployeeView ebooks={ebooks} />}
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
      </div>
    </div>
  );

  // ✅ Check view permission - Access Denied if no view permission
  if (!permissions.can_view) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You do not have permission to view the library.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <CourseLayout>
      <div className="p-6 space-y-0">
        {/* Breadcrumb */}
        <Card className="rounded-lg shadow-md bg-gradient-to-r from-blue-900 to-blue-500 text-white">
          <CardContent className="flex items-center text-base font-semibold text-white space-x-3 p-6">
            <Link href="/dashboard" className="">
              Home
            </Link>
            <ChevronRight className="w-5 h-5 text-white" />
            <Link href="/library" className="">
              Library
            </Link>
          </CardContent>
        </Card>

        <div>
          {currentPage === "main" && <MainPage />}
          {currentPage === "addContent" && <AddContentPage />}
          {currentPage === "ViewEbook" && <ViewContentEbook />}
        </div>
      </div>
    </CourseLayout>
  );
}
