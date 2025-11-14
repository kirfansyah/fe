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
} from "lucide-react";
import { useState, useEffect, useContext } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { AuthContext } from "contexts/AuthContext";
import { LanguageContext } from "contexts/LanguageContext";
import { ProfileContext } from "contexts/profile/ProfileContext";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function Ebook({
  ebooks,
  categorys,
  subCategorys,
  onViewContent,
  onAddContent,
  onSave,
  onUpdate,
  onDelete,
}) {
  const [expandedEbook, setExpandedEbook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEbookId, setCurrentEbookId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState(null);

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
    ebookTitle: "",
    category: "",
    subCategory: "",
    author: "",
    description: "",
    coverUpload: "",
    ebookUpload: "",
  });

  const [touched, setTouched] = useState({
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
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (ebook) => {
    setEbookToDelete(ebook);
    setIsDeleteModalOpen(true);
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
    const titleError = validateField("ebookTitle", ebookTitle);
    const categoryError = validateField("category", selectedCategory);
    const subCategoryError = validateField("subCategory", selectedSubCategory);
    const authorError = validateField("author", author);
    const descriptionError = validateField("description", description);
    const coverError = validateField("coverUpload", coverUpload);
    const ebookError = validateField("ebookUpload", ebookUpload);

    setErrors({
      ebookTitle: titleError,
      category: categoryError,
      subCategory: subCategoryError,
      author: authorError,
      description: descriptionError,
      coverUpload: coverError,
      ebookUpload: ebookError,
    });

    setTouched({
      ebookTitle: true,
      category: true,
      subCategory: true,
      author: true,
      description: true,
      coverUpload: true,
      ebookUpload: true,
    });

    return (
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
      ebookTitle: "",
      category: "",
      subCategory: "",
      author: "",
      description: "",
      coverUpload: "",
      ebookUpload: "",
    });
    setTouched({
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
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">eBook List</h2>
        <button
          onClick={handleOpenAddModal}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Add eBook
        </button>
      </div>

      <div className="bg-slate-100">
        <div className="bg-gray">
          {ebooks.map((ebook) => (
            <div key={ebook.id_ebook} className="border-b border-gray-200">
              {/* Main ebook Row */}
              <div className="flex items-center justify-between py-4 px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleEbook(ebook.id_ebook)}
                    className="p-1"
                  >
                    <Menu className="w-6 h-6 text-gray-600" />
                  </button>
                  <span className="text-lg font-medium text-gray-900 tracking-wide">
                    {ebook.title}
                  </span>
                </div>

                <div className="flex items-center space-x-6">
                  <button
                    onClick={() =>
                      onViewContent && onViewContent(ebook.id_ebook)
                    }
                    className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <EyeIcon className="w-4 h-4 text-gray-400" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(ebook)}
                    className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(ebook)}
                    className="flex items-center space-x-2 px-3 py-1 text-sm text-red-700 hover:bg-red-50 rounded"
                  >
                    <CircleX className="w-4 h-4 text-red-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Expanded Modules */}
              {expandedEbook === ebook.id_ebook && (
                <div className="bg-white">
                  {ebook.contents?.map((module) => (
                    <div
                      key={module.id_ebook_content}
                      className="flex items-center justify-between py-1 px-6 ml-10 border-l-2 border-gray-300 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Menu className="w-2 h-5 text-gray-500" />
                        <span className="text-gray-700">
                          {module.content_type_name}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        {module.content_type_name && (
                          <span className="bg-green-500 text-white text-xs px-2 rounded font-medium">
                            Preview
                          </span>
                        )}

                        <button className="w-2 h-5 text-gray-400 hover:text-gray-600">
                          <SquarePen className="w-2 h-5" />
                        </button>

                        <button className="w-2 h-5 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-2 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Add/Edit ebook */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancel}
        >
          <div
            className="rounded-xl border border-gray-200 bg-white shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex items-center gap-2 rounded-t-xl border-b bg-gradient-to-b from-gray-50 to-white px-6 py-4 flex-shrink-0">
              <CirclePlus className="h-6 w-6 text-green-600" />
              <h3 className="text-base font-semibold text-gray-900">
                {isEditMode ? "Edit eBook" : "Add New eBook"}
              </h3>
            </div>

            {/* Body - Scrollable */}
            <div className="overflow-y-auto px-6 py-4 flex-1">
              <div className="space-y-4">
                {/* Ebook Title */}
                <div className="grid grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Ebook Title <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={ebookTitle}
                      onChange={handleEbookTitleChange}
                      onBlur={() => handleBlur("ebookTitle")}
                      className={getInputClass(
                        "ebookTitle",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                      placeholder="Type ebook title..."
                    />
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.ebookTitle && errors.ebookTitle && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.ebookTitle}</span>
                      </span>
                    )}
                    {touched.ebookTitle && !errors.ebookTitle && ebookTitle && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Valid</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="grid grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      onBlur={() => handleBlur("category")}
                      className={getInputClass(
                        "category",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
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
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.category && errors.category && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.category}</span>
                      </span>
                    )}
                    {touched.category &&
                      !errors.category &&
                      selectedCategory && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Sub Category */}
                <div className="grid grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Sub Category <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <select
                      value={selectedSubCategory}
                      onChange={handleSubCategoryChange}
                      onBlur={() => handleBlur("subCategory")}
                      disabled={
                        !selectedCategory || filteredSubCategories.length === 0
                      }
                      className={getInputClass(
                        "subCategory",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300"
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
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.subCategory &&
                      errors.subCategory &&
                      selectedCategory && (
                        <span className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{errors.subCategory}</span>
                        </span>
                      )}
                    {touched.subCategory &&
                      !errors.subCategory &&
                      selectedSubCategory && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Author */}
                <div className="grid grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={author}
                      onChange={handleAuthorChange}
                      onBlur={() => handleBlur("author")}
                      className={getInputClass(
                        "author",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                      placeholder="Type author name..."
                    />
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.author && errors.author && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.author}</span>
                      </span>
                    )}
                    {touched.author && !errors.author && author && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Valid</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <div
                      className={getInputClass(
                        "description",
                        "rounded-md border transition-colors"
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
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.description && errors.description && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.description}</span>
                      </span>
                    )}
                    {touched.description &&
                      !errors.description &&
                      description &&
                      description !== "<p><br></p>" && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Upload Cover */}
                <div className="grid grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Upload Cover <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUploadChange}
                      onBlur={() => handleBlur("coverUpload")}
                      className={getInputClass(
                        "coverUpload",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                    />
                    {isEditMode && existingCoverUrl && !coverUpload && (
                      <p className="text-xs text-gray-600 mt-1">
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
                      <p className="text-xs text-gray-600 mt-1">
                        New file selected: {coverUpload.name}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.coverUpload && errors.coverUpload && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.coverUpload}</span>
                      </span>
                    )}

                    {touched.coverUpload &&
                      !errors.coverUpload &&
                      (coverUpload ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {coverUpload.name
                              ? `File: ${coverUpload.name}`
                              : "Valid"}
                          </span>
                        </span>
                      ) : isEditMode && existingCoverUrl ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      ) : null)}
                  </div>
                </div>

                {/* Upload eBook */}
                <div className="grid grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Upload eBook <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="file"
                      accept=".pdf,.epub"
                      onChange={handleEbookUploadChange}
                      onBlur={() => handleBlur("ebookUpload")}
                      className={getInputClass(
                        "ebookUpload",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                    />
                    {isEditMode && existingEbookUrl && !ebookUpload && (
                      <p className="text-xs text-gray-600 mt-1">
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
                      <p className="text-xs text-gray-600 mt-1">
                        New file selected: {ebookUpload.name}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.ebookUpload && errors.ebookUpload && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.ebookUpload}</span>
                      </span>
                    )}
                    {touched.ebookUpload &&
                      !errors.ebookUpload &&
                      (ebookUpload ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {ebookUpload.name
                              ? `File: ${ebookUpload.name}`
                              : "Valid"}
                          </span>
                        </span>
                      ) : isEditMode && existingEbookUrl ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      ) : null)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="flex items-center justify-center gap-6 px-6 py-4 border-t bg-gray-50 rounded-b-xl flex-shrink-0">
              <button
                onClick={handleSave}
                className="rounded-full bg-green-600 px-8 py-2 text-sm font-semibold text-white shadow hover:bg-green-700 transition-colors"
              >
                {isEditMode ? "Update" : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="rounded-full bg-red-600 px-8 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition-colors"
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancelDelete}
        >
          <div
            className="rounded-xl border border-gray-200 bg-white shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-2 rounded-t-xl border-b bg-gradient-to-b from-red-50 to-white px-6 py-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-base font-semibold text-gray-900">
                Delete eBook
              </h3>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <strong>"{ebookToDelete?.title}"</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={handleCancelDelete}
                className="rounded-full bg-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition-colors"
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
