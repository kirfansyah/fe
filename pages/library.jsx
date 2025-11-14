import { useState, useCallback } from "react";
import CourseLayout from "@/layouts/CourseLayout";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ChevronRight, Star, FileText, Video } from "lucide-react";

import EbookListView from "../components/Library/EbookEmployee";
import EbookEmployeeView from "../components/Library/EbookEmployee";
import ContentAdditionView from "../components/Course/AddContent";
import ContentViewEbook from "../components/Library/ViewEbook";
import { useEbooks } from "../hooks/useEbooks";

export default function Library() {
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
