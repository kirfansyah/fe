import { useState, useCallback, useEffect } from "react";
import Admin from "layouts/Admin.js";
import EbookListView from "../../components/Library/EbookList";
import MonitoringView from "../../components/Library/Monitoring";
import ContentAdditionView from "../../components/Course/AddContent";
import ContentViewEbook from "../../components/Library/ViewEbook";
import { useEbooks } from "../../hooks/useEbooks";
import {
  BookOpen,
  BarChart3,
  ChevronRight,
  Home,
  CircleX,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useSweetAlert } from "@/hooks/useSweetAlert";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function Management() {
  const [activeTab, setActiveTab] = useState("ebooks-list");
  const [currentPage, setCurrentPage] = useState("main");
  const [selectedEbookId, setSelectedEbookId] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEbookId, setCurrentEbookId] = useState(null);

  // Form states
  const [selectedCompany, setSelectedCompany] = useState("");
  const [ebookTitle, setEbookTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [coverUpload, setCoverUpload] = useState(null);
  const [ebookUpload, setEbookUpload] = useState(null);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [existingCoverUrl, setExistingCoverUrl] = useState("");
  const [existingEbookUrl, setExistingEbookUrl] = useState("");

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const {
    ebooks,
    categorys,
    subCategorys,
    employees,
    addEbook,
    updateEbook,
    deleteEbook,
  } = useEbooks();

  const {
    confirmAction,
    showSuccess,
    showError,
    showWarning,
    showLoading,
    closeLoading,
    showUpdateSuccess,
  } = useSweetAlert();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  // Filter subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const filtered =
        subCategorys?.filter(
          (sub) => sub.id_category === parseInt(selectedCategory)
        ) || [];
      setFilteredSubCategories(filtered);
      if (!isEditMode) {
        setSelectedSubCategory("");
      }
    } else {
      setFilteredSubCategories([]);
      if (!isEditMode) {
        setSelectedSubCategory("");
      }
    }
  }, [selectedCategory, subCategorys, isEditMode]);

  const handleViewEbook = (ebookId) => {
    setSelectedEbookId(ebookId);
    setCurrentPage("ViewEbook");
  };

  const handleAddContent = (ebookId) => {
    setSelectedEbookId(ebookId);
    setCurrentPage("addContent");
  };

  // Open modal handler - called from EbookList
  const handleOpenModal = (ebook) => {
    if (ebook) {
      // Edit mode
      setIsEditMode(true);
      setCurrentEbookId(ebook.id_ebook);
      setSelectedCompany(ebook.company_id?.toString() || "");
      setEbookTitle(ebook.title || "");
      setSelectedCategory(ebook.id_category?.toString() || "");
      setSelectedSubCategory(ebook.id_subcategory?.toString() || "");
      setAuthor(ebook.author || "");
      setDescription(ebook.description || "");
      setExistingCoverUrl(ebook.cover_image_url || "");
      setExistingEbookUrl(ebook.file_url || "");
      setCoverUpload(null);
      setEbookUpload(null);
    } else {
      // Add mode
      setIsEditMode(false);
      setCurrentEbookId(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setSelectedCompany("");
    setEbookTitle("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setAuthor("");
    setDescription("");
    setCoverUpload(null);
    setEbookUpload(null);
    setExistingCoverUrl("");
    setExistingEbookUrl("");
    setErrors({});
    setTouched({});
  };

  const handleCloseModal = () => {
    resetForm();
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentEbookId(null);
  };

  // Validation
  const validateField = (fieldName, value) => {
    let error = "";
    switch (fieldName) {
      case "company":
        if (!value) error = "Required";
        break;
      case "ebookTitle":
        if (!value?.trim()) error = "Required";
        else if (value.trim().length < 3) error = "Min 3 chars";
        break;
      case "category":
        if (!value) error = "Required";
        break;
      case "subCategory":
        if (!value) error = "Required";
        break;
      case "author":
        if (!value?.trim()) error = "Required";
        break;
      case "description":
        if (!value?.trim() || value === "<p><br></p>") error = "Required";
        break;
      case "coverUpload":
        if (!isEditMode && !value) error = "Required";
        break;
      case "ebookUpload":
        if (!isEditMode && !value) error = "Required";
        break;
    }
    return error;
  };

  const handleBlur = (fieldName, value) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    setErrors((prev) => ({
      ...prev,
      [fieldName]: validateField(fieldName, value),
    }));
  };

  const validateAll = () => {
    const newErrors = {
      company: validateField("company", selectedCompany),
      ebookTitle: validateField("ebookTitle", ebookTitle),
      category: validateField("category", selectedCategory),
      subCategory: validateField("subCategory", selectedSubCategory),
      author: validateField("author", author),
      description: validateField("description", description),
      coverUpload: validateField("coverUpload", coverUpload),
      ebookUpload: validateField("ebookUpload", ebookUpload),
    };
    setErrors(newErrors);
    setTouched({
      company: true,
      ebookTitle: true,
      category: true,
      subCategory: true,
      author: true,
      description: true,
      coverUpload: true,
      ebookUpload: true,
    });
    return !Object.values(newErrors).some((e) => e);
  };

  const getInputClass = (fieldName, base) => {
    if (!touched[fieldName]) return base;
    if (errors[fieldName]) return `${base} border-red-500 focus:ring-red-500`;
    return `${base} border-green-500 focus:ring-green-500`;
  };

  // Save handler
  const handleSaveEbook = async () => {
    if (!validateAll()) {
      showWarning("Please fill in all required fields.");
      return;
    }

    // Simpan data form sebelum tutup modal
    const ebookData = {
      company_id: selectedCompany,
      title: ebookTitle,
      id_category: selectedCategory,
      id_subcategory: selectedSubCategory,
      author,
      description,
      cover_image: coverUpload,
      file_path: ebookUpload,
      created_by: "Admin",
      created_device: "Web",
    };

    const currentTitle = ebookTitle;
    const currentIsEditMode = isEditMode;
    const currentEbookIdToUpdate = currentEbookId;

    // Confirm for update - tutup modal dulu agar SweetAlert di atas
    if (currentIsEditMode) {
      setIsModalOpen(false); // Tutup modal sementara

      const result = await confirmAction({
        title: "Update eBook",
        text: `Are you sure you want to update "${currentTitle}"?`,
        confirmButtonText: "Yes, update it!",
        cancelButtonText: "Cancel",
        icon: "question",
        confirmButtonColor: "#3b82f6",
      });

      if (!result.isConfirmed) {
        setIsModalOpen(true); // Buka kembali modal jika cancel
        return;
      }
    }

    try {
      // Tutup modal sebelum loading
      setIsModalOpen(false);
      showLoading(currentIsEditMode ? "Updating eBook..." : "Saving eBook...");

      if (currentIsEditMode) {
        await updateEbook(currentEbookIdToUpdate, ebookData);
        closeLoading();
        showUpdateSuccess("eBook updated successfully!");
      } else {
        await addEbook(ebookData);
        closeLoading();
        showSuccess("eBook created successfully!");
      }
      resetForm();
      setIsEditMode(false);
      setCurrentEbookId(null);
    } catch (error) {
      closeLoading();
      showError("Failed to save eBook. Please try again.");
      console.error("Error saving ebook:", error);
      // Buka kembali modal jika error
      setIsModalOpen(true);
    }
  };

  const handleDeleteEbook = async (id) => {
    try {
      await deleteEbook(id);
    } catch (error) {
      console.error("Error deleting ebook:", error);
    }
  };

  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
  ];

  const MainPage = () => (
    <div className="mt-4 sm:mt-6 mx-2 sm:mx-4 lg:mx-6">
      {/* Header */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Library</h1>
            <p className="text-gray-600 text-sm">
              Manage your library and monitoring
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Home className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Home</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Library</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("ebooks-list")}
            className={`flex items-center gap-3 px-6 py-4 font-medium text-sm transition-all duration-200 relative ${
              activeTab === "ebooks-list"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>eBook List</span>
            {activeTab === "ebooks-list" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("monitoring")}
            className={`flex items-center gap-3 px-6 py-4 font-medium text-sm transition-all duration-200 relative ${
              activeTab === "monitoring"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Monitoring</span>
            {activeTab === "monitoring" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-0">
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
                  onDelete={handleDeleteEbook}
                  onOpenModal={handleOpenModal}
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
      categorys={categorys}
    />
  );

  return (
    <div>
      {currentPage === "main" && <MainPage />}
      {currentPage === "addContent" && <AddContentPage />}
      {currentPage === "ViewEbook" && <ViewContentEbook />}

      {/* Modal - At root level, truly fixed */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[99999] overflow-hidden"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Modal Container - Centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-3xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {isEditMode ? "Edit eBook" : "Add New eBook"}
                  </h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <CircleX className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="space-y-3">
                  {/* Company */}
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <label className="col-span-3 text-xs font-medium text-gray-700 pt-2">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <div className="col-span-7">
                      <select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        onBlur={() => handleBlur("company", selectedCompany)}
                        className={getInputClass(
                          "company",
                          "w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1"
                        )}
                      >
                        <option value="">Select Company</option>
                        {companys?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.company_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 pt-2">
                      {touched.company && errors.company && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {touched.company &&
                        !errors.company &&
                        selectedCompany && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <label className="col-span-3 text-xs font-medium text-gray-700 pt-2">
                      eBook Title <span className="text-red-500">*</span>
                    </label>
                    <div className="col-span-7">
                      <input
                        type="text"
                        value={ebookTitle}
                        onChange={(e) => setEbookTitle(e.target.value)}
                        onBlur={() => handleBlur("ebookTitle", ebookTitle)}
                        placeholder="Enter title"
                        className={getInputClass(
                          "ebookTitle",
                          "w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1"
                        )}
                      />
                    </div>
                    <div className="col-span-2 pt-2">
                      {touched.ebookTitle && errors.ebookTitle && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {touched.ebookTitle &&
                        !errors.ebookTitle &&
                        ebookTitle && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <label className="col-span-3 text-xs font-medium text-gray-700 pt-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="col-span-7">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        onBlur={() => handleBlur("category", selectedCategory)}
                        className={getInputClass(
                          "category",
                          "w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1"
                        )}
                      >
                        <option value="">Select Category</option>
                        {categorys?.map((c) => (
                          <option key={c.id_category} value={c.id_category}>
                            {c.category_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 pt-2">
                      {touched.category && errors.category && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {touched.category &&
                        !errors.category &&
                        selectedCategory && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                    </div>
                  </div>

                  {/* Sub Category */}
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <label className="col-span-3 text-xs font-medium text-gray-700 pt-2">
                      Sub Category <span className="text-red-500">*</span>
                    </label>
                    <div className="col-span-7">
                      <select
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        onBlur={() =>
                          handleBlur("subCategory", selectedSubCategory)
                        }
                        disabled={!selectedCategory}
                        className={getInputClass(
                          "subCategory",
                          `w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 ${
                            !selectedCategory
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                          }`
                        )}
                      >
                        <option value="">
                          {!selectedCategory
                            ? "Select category first"
                            : "Select Sub Category"}
                        </option>
                        {filteredSubCategories?.map((s) => (
                          <option
                            key={s.id_subcategory}
                            value={s.id_subcategory}
                          >
                            {s.subcategory_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 pt-2">
                      {touched.subCategory &&
                        errors.subCategory &&
                        selectedCategory && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      {touched.subCategory &&
                        !errors.subCategory &&
                        selectedSubCategory && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                    </div>
                  </div>

                  {/* Author */}
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <label className="col-span-3 text-xs font-medium text-gray-700 pt-2">
                      Author <span className="text-red-500">*</span>
                    </label>
                    <div className="col-span-7">
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        onBlur={() => handleBlur("author", author)}
                        placeholder="Enter author"
                        className={getInputClass(
                          "author",
                          "w-full rounded-md border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1"
                        )}
                      />
                    </div>
                    <div className="col-span-2 pt-2">
                      {touched.author && errors.author && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {touched.author && !errors.author && author && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <label className="col-span-3 text-xs font-medium text-gray-700 pt-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <div className="col-span-7">
                      <div
                        className={`rounded-md overflow-hidden ${
                          touched.description && errors.description
                            ? "ring-1 ring-red-500"
                            : touched.description &&
                              !errors.description &&
                              description &&
                              description !== "<p><br></p>"
                            ? "ring-1 ring-green-500"
                            : ""
                        }`}
                      >
                        <ReactQuill
                          value={description}
                          onChange={setDescription}
                          onBlur={() => handleBlur("description", description)}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Enter description..."
                          className="quill-compact"
                        />
                      </div>
                    </div>
                    <div className="col-span-2 pt-2">
                      {touched.description && errors.description && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {touched.description &&
                        !errors.description &&
                        description &&
                        description !== "<p><br></p>" && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                    </div>
                  </div>

                  {/* Cover Upload */}
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <label className="col-span-3 text-xs font-medium text-gray-700 pt-2">
                      Cover Image <span className="text-red-500">*</span>
                    </label>
                    <div className="col-span-7">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverUpload(e.target.files[0])}
                        onBlur={() => handleBlur("coverUpload", coverUpload)}
                        className={getInputClass(
                          "coverUpload",
                          "w-full rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
                        )}
                      />
                      {isEditMode && existingCoverUrl && !coverUpload && (
                        <a
                          href={existingCoverUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View existing
                        </a>
                      )}
                    </div>
                    <div className="col-span-2 pt-2">
                      {touched.coverUpload && errors.coverUpload && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {touched.coverUpload &&
                        !errors.coverUpload &&
                        (coverUpload || (isEditMode && existingCoverUrl)) && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                    </div>
                  </div>

                  {/* eBook Upload */}
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <label className="col-span-3 text-xs font-medium text-gray-700 pt-2">
                      eBook File <span className="text-red-500">*</span>
                    </label>
                    <div className="col-span-7">
                      <input
                        type="file"
                        accept=".pdf,.epub"
                        onChange={(e) => setEbookUpload(e.target.files[0])}
                        onBlur={() => handleBlur("ebookUpload", ebookUpload)}
                        className={getInputClass(
                          "ebookUpload",
                          "w-full rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
                        )}
                      />
                      {isEditMode && existingEbookUrl && !ebookUpload && (
                        <a
                          href={existingEbookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View existing
                        </a>
                      )}
                    </div>
                    <div className="col-span-2 pt-2">
                      {touched.ebookUpload && errors.ebookUpload && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {touched.ebookUpload &&
                        !errors.ebookUpload &&
                        (ebookUpload || (isEditMode && existingEbookUrl)) && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-gray-50 rounded-b-xl">
                <button
                  onClick={handleCloseModal}
                  className="rounded-lg bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEbook}
                  className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-1.5 text-sm font-medium text-white hover:from-green-600 hover:to-green-700 transition-all"
                >
                  {isEditMode ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global styles for Quill */}
      <style jsx global>{`
        .quill-compact .ql-toolbar {
          padding: 4px 8px;
          border-color: #e5e7eb;
        }
        .quill-compact .ql-container {
          font-size: 13px;
          border-color: #e5e7eb;
        }
        .quill-compact .ql-editor {
          min-height: 60px;
          max-height: 80px;
          padding: 8px 12px;
        }
        .quill-compact .ql-editor.ql-blank::before {
          font-size: 13px;
          font-style: normal;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}

Management.layout = Admin;
