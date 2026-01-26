import {
  Plus,
  Trash2,
  SquarePen,
  EyeIcon,
  Edit,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
  MoreVertical,
  Building2,
} from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "contexts/AuthContext";
import { LanguageContext } from "contexts/LanguageContext";
import { ProfileContext } from "contexts/profile/ProfileContext";
import { useSweetAlert } from "@/hooks/useSweetAlert";

export default function EbookList({
  ebooks,
  categorys,
  subCategorys,
  companys,
  onViewContent,
  onAddContent,
  onSave,
  onUpdate,
  onDelete,
  onOpenModal,
}) {
  const {
    confirmAction,
    showLoading,
    closeLoading,
    showDeleteSuccess,
    showError,
  } = useSweetAlert();

  const [expandedEbook, setExpandedEbook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [selectedCompanyUnit, setSelectedCompanyUnit] = useState("");

  const { stateLanguage, changeLanguage } = useContext(LanguageContext);
  const { getSession, stateAuth, Logout } = useContext(AuthContext);
  const { getKaryawan, dataKaryawan } = useContext(ProfileContext);

  const toggleEbook = (ebookId) => {
    setExpandedEbook(expandedEbook === ebookId ? null : ebookId);
  };

  // Get unique company names for filter
  const companyNames = [
    ...new Set(ebooks.map((e) => e.company_name).filter(Boolean)),
  ];

  // Filter ebooks based on search and company unit
  const filteredEbooks = ebooks.filter((ebook) => {
    const matchSearch =
      ebook.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ebook.author?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCompanyUnit =
      !selectedCompanyUnit || ebook.company_name === selectedCompanyUnit;

    return matchSearch && matchCompanyUnit;
  });

  // Handle delete with SweetAlert confirmation
  const handleDeleteEbook = async (ebook) => {
    setMobileMenuOpen(null);

    const result = await confirmAction({
      title: "Delete eBook",
      text: `Are you sure you want to delete "${ebook.title}"? This action cannot be undone.`,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        showLoading("Deleting eBook...");
        await onDelete(ebook.id_ebook);
        closeLoading();
        showDeleteSuccess("eBook deleted successfully!");
      } catch (error) {
        closeLoading();
        showError("Failed to delete eBook. Please try again.");
        console.error("Error deleting ebook:", error);
      }
    }
  };

  // Handle edit - open modal via parent
  const handleEditEbook = (ebook) => {
    setMobileMenuOpen(null);
    onOpenModal(ebook); // Pass ebook data to parent
  };

  // Handle add - open modal via parent
  const handleAddEbook = () => {
    onOpenModal(null); // null means add new
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header Section - Single Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/4 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search ebooks by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex min-w-[100px] w-[500px] pl-10 sm:pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="relative flex-1 min-w-0">
          {/* Company Unit Filter - Wider */}
          <select
            value={selectedCompanyUnit}
            onChange={(e) => setSelectedCompanyUnit(e.target.value)}
            className="flex min-w-[200px] w-[500px] px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-700"
          >
            <option value="">All Company Units</option>
            {companyNames.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        {/* Add eBook Button */}
        <button
          onClick={handleAddEbook}
          className="flex lg:fixed lg:right-6 items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-5 py-2.5 rounded-lg font-medium shadow-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add eBook</span>
        </button>
      </div>

      {/* Active Filters Display */}
      {selectedCompanyUnit && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
            <Building2 className="w-3 h-3" />
            {selectedCompanyUnit}
            <button
              onClick={() => setSelectedCompanyUnit("")}
              className="hover:text-blue-900 ml-1"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* eBook List */}
      <div className="space-y-3">
        {filteredEbooks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm sm:text-base">
              No ebooks found
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Try adjusting your search or add a new ebook
            </p>
          </div>
        ) : (
          filteredEbooks.map((ebook) => (
            <div
              key={ebook.id_ebook}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between p-3 sm:p-5">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* <button
                    onClick={() => toggleEbook(ebook.id_ebook)}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    {expandedEbook === ebook.id_ebook ? (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    )}
                  </button> */}

                  <div className="hidden sm:flex p-2.5 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                      {ebook.title}
                    </h3>
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full w-fit">
                      <Building2 className="w-3 h-3" />
                      {ebook.company_name || "All Company Unit"}
                    </span>
                  </div>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() =>
                      onViewContent && onViewContent(ebook.id_ebook)
                    }
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEditEbook(ebook)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEbook(ebook)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Mobile Actions Menu */}
                <div className="md:hidden relative">
                  <button
                    onClick={() =>
                      setMobileMenuOpen(
                        mobileMenuOpen === ebook.id_ebook
                          ? null
                          : ebook.id_ebook,
                      )
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>

                  {mobileMenuOpen === ebook.id_ebook && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMobileMenuOpen(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                        <button
                          onClick={() => {
                            onViewContent && onViewContent(ebook.id_ebook);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <EyeIcon className="w-4 h-4 text-gray-400" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleEditEbook(ebook)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEbook(ebook)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Expanded Chapters */}
              {expandedEbook === ebook.id_ebook &&
                ebook.contents?.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    {ebook.contents.map((module, index) => (
                      <div
                        key={module.id_ebook_content}
                        className="flex items-center justify-between py-3 px-4 sm:px-6 ml-8 sm:ml-12 border-l-2 border-blue-200 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700 truncate">
                            {module.content_type_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="hidden sm:inline-flex bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                            Preview
                          </span>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                            <SquarePen className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
