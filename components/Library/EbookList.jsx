import {
  Plus,
  Trash2,
  Menu,
  Globe,
  CirclePlus,
  CircleX,
  SquarePen,
  EyeClosed,
  EyeIcon,
  Edit,
  AlertCircle,
  CheckCircle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Building2,
} from "lucide-react";
import { useState, useEffect, useContext } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { AuthContext } from "contexts/AuthContext";
import { LanguageContext } from "contexts/LanguageContext";
import { ProfileContext } from "contexts/profile/ProfileContext";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

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
}) {
  console.log("comp = ", companys);
  const [expandedEbook, setExpandedEbook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEbookId, setCurrentEbookId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

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

  // Existing cover and ebook URLs for edit mode
  const [existingCoverUrl, setExistingCoverUrl] = useState("");
  const [existingEbookUrl, setExistingEbookUrl] = useState("");

  // Validation states
  const [errors, setErrors] = useState({
    company: "",
    ebookTitle: "",
    category: "",
    subCategory: "",
    author: "",
    description: "",
    coverUpload: "",
    ebookUpload: "",
  });

  const [touched, setTouched] = useState({
    company: false,
    ebookTitle: false,
    category: false,
    subCategory: false,
    author: false,
    description: false,
    coverUpload: false,
    ebookUpload: false,
  });

  const toggleEbook = (ebookId) => {
    setExpandedEbook(expandedEbook === ebookId ? null : ebookId);
  };

  const { stateLanguage, changeLanguage } = useContext(LanguageContext);
  const { getSession, stateAuth, Logout } = useContext(AuthContext);

  const { getKaryawan, dataKaryawan } = useContext(ProfileContext);

  const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];

  // Filter ebooks based on search
  const filteredEbooks = ebooks.filter(
    (ebook) =>
      ebook.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ebook.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter subcategories ketika category dipilih
  useEffect(() => {
    if (selectedCategory) {
      const filtered =
        subCategorys?.filter(
          (sub) => sub.id_category === parseInt(selectedCategory)
        ) || [];
      setFilteredSubCategories(filtered);

      // Jangan reset subcategory jika sedang edit mode
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

  // Open modal for adding new ebook
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCurrentEbookId(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing ebook
  const handleOpenEditModal = (ebook) => {
    setIsEditMode(true);
    setCurrentEbookId(ebook.id_ebook);

    // Populate form with existing data
    setSelectedCompany(ebook.company_id?.toString() || "");
    setEbookTitle(ebook.title || "");
    setSelectedCategory(ebook.id_category?.toString() || "");
    setSelectedSubCategory(ebook.id_subcategory?.toString() || "");
    setAuthor(ebook.author || "");
    setDescription(ebook.description || "");
    setExistingCoverUrl(ebook.cover_image_url || "");
    setExistingEbookUrl(ebook.file_url || "");

    // Reset file inputs
    setCoverUpload(null);
    setEbookUpload(null);

    setIsModalOpen(true);
    setMobileMenuOpen(null);
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (ebook) => {
    setEbookToDelete(ebook);
    setIsDeleteModalOpen(true);
    setMobileMenuOpen(null);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (ebookToDelete) {
      try {
        await onDelete(ebookToDelete.id_ebook);
        setIsDeleteModalOpen(false);
        setEbookToDelete(null);
      } catch (error) {
        console.error("Error deleting ebook:", error);
      }
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setEbookToDelete(null);
  };

  // Validate individual field
  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "company":
        if (!value) {
          error = "Company is required";
        }
        break;
      case "ebookTitle":
        if (!value || value.trim() === "") {
          error = "Title is required";
        } else if (value.trim().length < 3) {
          error = "Min 3 characters";
        } else if (value.trim().length > 100) {
          error = "Max 100 characters";
        }
        break;
      case "category":
        if (!value) {
          error = "Category is required";
        }
        break;
      case "subCategory":
        if (!value) {
          error = "Sub category is required";
        }
        break;
      case "author":
        if (!value || value.trim() === "") {
          error = "Author is required";
        } else if (value.trim().length < 2) {
          error = "Min 2 characters";
        }
        break;
      case "description":
        if (!value || value.trim() === "" || value === "<p><br></p>") {
          error = "Description is required";
        } else if (value.length < 10) {
          error = "Min 10 characters";
        }
        break;
      case "coverUpload":
        // Tidak wajib jika edit mode dan ada cover existing
        if (!isEditMode && !value) {
          error = "Cover image is required";
        }
        break;
      case "ebookUpload":
        // Tidak wajib jika edit mode dan ada ebook existing
        if (!isEditMode && !value) {
          error = "eBook file is required";
        }
        break;
      default:
        break;
    }

    return error;
  };

  // Handle blur event
  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    let value = "";
    switch (fieldName) {
      case "company":
        value = selectedCompany;
        break;
      case "ebookTitle":
        value = ebookTitle;
        break;
      case "category":
        value = selectedCategory;
        break;
      case "subCategory":
        value = selectedSubCategory;
        break;
      case "author":
        value = author;
        break;
      case "description":
        value = description;
        break;
      case "coverUpload":
        value = coverUpload;
        break;
      case "ebookUpload":
        value = ebookUpload;
        break;
    }

    const error = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  // Handle input changes with validation
  const handleCompanyChange = (e) => {
    const value = e.target.value;
    setSelectedCompany(value);
    if (touched.company) {
      const error = validateField("company", value);
      setErrors((prev) => ({ ...prev, company: error }));
    }
  };

  const handleEbookTitleChange = (e) => {
    const value = e.target.value;
    setEbookTitle(value);
    if (touched.ebookTitle) {
      const error = validateField("ebookTitle", value);
      setErrors((prev) => ({ ...prev, ebookTitle: error }));
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (touched.category) {
      const error = validateField("category", value);
      setErrors((prev) => ({ ...prev, category: error }));
    }
  };

  const handleSubCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedSubCategory(value);
    if (touched.subCategory) {
      const error = validateField("subCategory", value);
      setErrors((prev) => ({ ...prev, subCategory: error }));
    }
  };

  const handleAuthorChange = (e) => {
    const value = e.target.value;
    setAuthor(value);
    if (touched.author) {
      const error = validateField("author", value);
      setErrors((prev) => ({ ...prev, author: error }));
    }
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    if (touched.description) {
      const error = validateField("description", value);
      setErrors((prev) => ({ ...prev, description: error }));
    }
  };

  const handleCoverUploadChange = (e) => {
    const file = e.target.files[0];
    setCoverUpload(file);
    if (touched.coverUpload) {
      const error = validateField("coverUpload", file);
      setErrors((prev) => ({ ...prev, coverUpload: error }));
    }
  };

  const handleEbookUploadChange = (e) => {
    const file = e.target.files[0];
    setEbookUpload(file);
    if (touched.ebookUpload) {
      const error = validateField("ebookUpload", file);
      setErrors((prev) => ({ ...prev, ebookUpload: error }));
    }
  };

  // Validate all fields
  const validateAll = () => {
    const companyError = validateField("company", selectedCompany);
    const titleError = validateField("ebookTitle", ebookTitle);
    const categoryError = validateField("category", selectedCategory);
    const subCategoryError = validateField("subCategory", selectedSubCategory);
    const authorError = validateField("author", author);
    const descriptionError = validateField("description", description);
    const coverError = validateField("coverUpload", coverUpload);
    const ebookError = validateField("ebookUpload", ebookUpload);

    setErrors({
      company: companyError,
      ebookTitle: titleError,
      category: categoryError,
      subCategory: subCategoryError,
      author: authorError,
      description: descriptionError,
      coverUpload: coverError,
      ebookUpload: ebookError,
    });

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

    return (
      !companyError &&
      !titleError &&
      !categoryError &&
      !subCategoryError &&
      !authorError &&
      !descriptionError &&
      !coverError &&
      !ebookError
    );
  };

  // Get input class based on validation state
  const getInputClass = (fieldName, baseClass) => {
    if (!touched[fieldName]) {
      return baseClass;
    }

    if (errors[fieldName]) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500`;
    }

    return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500`;
  };

  // Handle save (create or update)
  const handleSave = async () => {
    if (!validateAll()) {
      return;
    }

    const ebookData = {
      company_id: selectedCompany,
      title: ebookTitle,
      id_category: selectedCategory,
      id_subcategory: selectedSubCategory,
      author: author,
      description: description,
      cover_image: coverUpload,
      file_path: ebookUpload,
      created_by: "Dadang harianto",
      created_device: "PC Dadang harianto",
    };

    try {
      if (isEditMode) {
        await onUpdate(currentEbookId, ebookData);
      } else {
        await onSave(ebookData);
      }
      handleCancel();
    } catch (error) {
      console.error("Error saving ebook:", error);
    }
  };

  // Reset form
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
    setErrors({
      company: "",
      ebookTitle: "",
      category: "",
      subCategory: "",
      author: "",
      description: "",
      coverUpload: "",
      ebookUpload: "",
    });
    setTouched({
      company: false,
      ebookTitle: false,
      category: false,
      subCategory: false,
      author: false,
      description: false,
      coverUpload: false,
      ebookUpload: false,
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentEbookId(null);
  };

  // React Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
    "background",
    "link",
  ];

  return (
    <div className="p-4 sm:p-6">
      {/* Header Section */}
      <div className="sm:flex-row items-right sm:justify-between gap-4 mb-6">
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-5 py-2.5 rounded-lg font-medium shadow-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 w-100 sm:w-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add eBook</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search ebooks by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

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
              {/* Main ebook Row */}
              <div className="flex items-center justify-between p-4 sm:p-5">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => toggleEbook(ebook.id_ebook)}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    {expandedEbook === ebook.id_ebook ? (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    )}
                  </button>

                  {/* Book Icon with gradient background */}
                  <div className="hidden sm:flex p-2.5 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                      {ebook.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {ebook.author || "Unknown Author"} •{" "}
                      {ebook.contents?.length || 0} chapters
                    </p>
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
                    onClick={() => handleOpenEditModal(ebook)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(ebook)}
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
                          : ebook.id_ebook
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
                          onClick={() => handleOpenEditModal(ebook)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(ebook)}
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

      {/* Modal for Add/Edit ebook */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCancel}
        >
          <div
            className="rounded-2xl bg-white shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex items-center gap-3 border-b bg-gradient-to-r from-green-50 to-emerald-50 px-4 sm:px-6 py-4 flex-shrink-0">
              <div className="p-2 bg-green-100 rounded-lg">
                <CirclePlus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {isEditMode ? "Edit eBook" : "Add New eBook"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {isEditMode
                    ? "Update ebook information"
                    : "Fill in the details below"}
                </p>
              </div>
            </div>

            {/* Body - Scrollable */}
            <div className="overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 flex-1">
              <div className="space-y-4 sm:space-y-5">
                {/* Company */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start">
                  <label className="sm:col-span-3 text-sm font-medium text-gray-700 sm:pt-2.5">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-7">
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                        onBlur={() => handleBlur("company")}
                        className={getInputClass(
                          "company",
                          "w-full rounded-lg border pl-10 pr-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors appearance-none bg-white"
                        )}
                      >
                        <option value="">Select company...</option>
                        {companys?.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.company_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex items-center sm:pt-2.5">
                    {touched.company && errors.company && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{errors.company}</span>
                      </span>
                    )}
                    {touched.company && !errors.company && selectedCompany && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Valid</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Ebook Title */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start">
                  <label className="sm:col-span-3 text-sm font-medium text-gray-700 sm:pt-2.5">
                    Ebook Title <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      value={ebookTitle}
                      onChange={handleEbookTitleChange}
                      onBlur={() => handleBlur("ebookTitle")}
                      className={getInputClass(
                        "ebookTitle",
                        "w-full rounded-lg border px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                      placeholder="Type ebook title..."
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center sm:pt-2.5">
                    {touched.ebookTitle && errors.ebookTitle && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{errors.ebookTitle}</span>
                      </span>
                    )}
                    {touched.ebookTitle && !errors.ebookTitle && ebookTitle && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Valid</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start">
                  <label className="sm:col-span-3 text-sm font-medium text-gray-700 sm:pt-2.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-7">
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      onBlur={() => handleBlur("category")}
                      className={getInputClass(
                        "category",
                        "w-full rounded-lg border px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                    >
                      <option value="">Select category...</option>
                      {categorys?.map((category) => (
                        <option
                          key={category.id_category}
                          value={category.id_category}
                        >
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex items-center sm:pt-2.5">
                    {touched.category && errors.category && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{errors.category}</span>
                      </span>
                    )}
                    {touched.category &&
                      !errors.category &&
                      selectedCategory && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Sub Category */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start">
                  <label className="sm:col-span-3 text-sm font-medium text-gray-700 sm:pt-2.5">
                    Sub Category <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-7">
                    <select
                      value={selectedSubCategory}
                      onChange={handleSubCategoryChange}
                      onBlur={() => handleBlur("subCategory")}
                      disabled={
                        !selectedCategory || filteredSubCategories.length === 0
                      }
                      className={getInputClass(
                        "subCategory",
                        "w-full rounded-lg border px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300"
                      )}
                    >
                      <option value="">
                        {!selectedCategory
                          ? "Select category first..."
                          : filteredSubCategories.length === 0
                          ? "No sub categories available"
                          : "Select sub category..."}
                      </option>
                      {filteredSubCategories.map((subCategory) => (
                        <option
                          key={subCategory.id_subcategory}
                          value={subCategory.id_subcategory}
                        >
                          {subCategory.subcategory_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex items-center sm:pt-2.5">
                    {touched.subCategory &&
                      errors.subCategory &&
                      selectedCategory && (
                        <span className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{errors.subCategory}</span>
                        </span>
                      )}
                    {touched.subCategory &&
                      !errors.subCategory &&
                      selectedSubCategory && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Author */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start">
                  <label className="sm:col-span-3 text-sm font-medium text-gray-700 sm:pt-2.5">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      value={author}
                      onChange={handleAuthorChange}
                      onBlur={() => handleBlur("author")}
                      className={getInputClass(
                        "author",
                        "w-full rounded-lg border px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                      placeholder="Type author name..."
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center sm:pt-2.5">
                    {touched.author && errors.author && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{errors.author}</span>
                      </span>
                    )}
                    {touched.author && !errors.author && author && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Valid</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start">
                  <label className="sm:col-span-3 text-sm font-medium text-gray-700 sm:pt-2.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-7">
                    <div
                      className={getInputClass(
                        "description",
                        "rounded-lg border transition-colors overflow-hidden"
                      )}
                      onBlur={() => handleBlur("description")}
                    >
                      <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={handleDescriptionChange}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Write description..."
                        style={{ height: "150px" }}
                      />
                    </div>
                    <div className="mb-12"></div>
                  </div>
                  <div className="sm:col-span-2 flex items-center sm:pt-2.5">
                    {touched.description && errors.description && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{errors.description}</span>
                      </span>
                    )}
                    {touched.description &&
                      !errors.description &&
                      description &&
                      description !== "<p><br></p>" && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Upload Cover */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start">
                  <label className="sm:col-span-3 text-sm font-medium text-gray-700 sm:pt-2.5">
                    Upload Cover <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-7">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUploadChange}
                      onBlur={() => handleBlur("coverUpload")}
                      className={getInputClass(
                        "coverUpload",
                        "w-full rounded-lg border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      )}
                    />
                    {isEditMode && existingCoverUrl && !coverUpload && (
                      <p className="text-xs text-gray-600 mt-2">
                        Current:{" "}
                        <a
                          href={existingCoverUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View existing cover
                        </a>
                      </p>
                    )}
                    {coverUpload && (
                      <p className="text-xs text-gray-600 mt-2">
                        New file selected: {coverUpload.name}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2 flex items-center sm:pt-2.5">
                    {touched.coverUpload && errors.coverUpload && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{errors.coverUpload}</span>
                      </span>
                    )}

                    {touched.coverUpload &&
                      !errors.coverUpload &&
                      (coverUpload ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      ) : isEditMode && existingCoverUrl ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      ) : null)}
                  </div>
                </div>

                {/* Upload eBook */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start">
                  <label className="sm:col-span-3 text-sm font-medium text-gray-700 sm:pt-2.5">
                    Upload eBook <span className="text-red-500">*</span>
                  </label>
                  <div className="sm:col-span-7">
                    <input
                      type="file"
                      accept=".pdf,.epub"
                      onChange={handleEbookUploadChange}
                      onBlur={() => handleBlur("ebookUpload")}
                      className={getInputClass(
                        "ebookUpload",
                        "w-full rounded-lg border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      )}
                    />
                    {isEditMode && existingEbookUrl && !ebookUpload && (
                      <p className="text-xs text-gray-600 mt-2">
                        Current:{" "}
                        <a
                          href={existingEbookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View existing eBook
                        </a>
                      </p>
                    )}
                    {ebookUpload && (
                      <p className="text-xs text-gray-600 mt-2">
                        New file selected: {ebookUpload.name}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2 flex items-center sm:pt-2.5">
                    {touched.ebookUpload && errors.ebookUpload && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{errors.ebookUpload}</span>
                      </span>
                    )}
                    {touched.ebookUpload &&
                      !errors.ebookUpload &&
                      (ebookUpload ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      ) : isEditMode && existingEbookUrl ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      ) : null)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 sm:px-6 py-4 border-t bg-gray-50 flex-shrink-0">
              <button
                onClick={handleSave}
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-green-500 to-green-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-green-600 hover:to-green-700 transition-all"
              >
                {isEditMode ? "Update" : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="w-full sm:w-auto rounded-full bg-gray-200 px-8 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCancelDelete}
        >
          <div
            className="rounded-2xl bg-white shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b bg-gradient-to-r from-red-50 to-rose-50 px-4 sm:px-6 py-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Delete eBook
              </h3>
            </div>

            {/* Body */}
            <div className="px-4 sm:px-6 py-5">
              <p className="text-gray-700 text-sm sm:text-base">
                Are you sure you want to delete{" "}
                <strong className="text-gray-900">
                  "{ebookToDelete?.title}"
                </strong>
                ?
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t bg-gray-50">
              <button
                onClick={handleCancelDelete}
                className="w-full sm:w-auto rounded-full bg-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-red-500 to-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-red-600 hover:to-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
