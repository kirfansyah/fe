import {
  Plus,
  Trash2,
  Globe,
  GlobeLock,
  FileText,
  ChevronDown,
  ChevronRight,
  Video,
  FileCheck,
  ClipboardList,
  Edit,
  X,
  Search,
  Upload,
  Grid,
  List,
  Copy,
  Eye,
} from "lucide-react";
import { useState, useContext } from "react";
import { useRouter } from "next/router";

import { useSweetAlert } from "../../hooks/useSweetAlert";
import { ProfileContext } from "@/contexts/profile/ProfileContext";
import {
  LoadingSpinner,
  CourseCardSkeleton,
  StatsCardSkeleton,
} from "@/components/Loading/Skeleton";
import { getDeviceInfo } from "@/lib/deviceHelper";
export default function Course({
  courses,
  onAddContent,
  onEditContent,
  onSave,
  onDelete,
  isLoading,
  isSaving,
  onDeleteContent,
  onViewContent,
  onDeleteContentSuccess,
  onDuplicateTest,
  permissions, // ✅ Receive permissions from parent
}) {
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  const router = useRouter();
  const { showLoading, showSuccess, showError, showWarning, confirmAction } =
    useSweetAlert();
  const { dataKaryawan } = useContext(ProfileContext);

  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showError("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showError("Image size should be less than 5MB");
        return;
      }

      const extension = file.name.split(".").pop();
      const newFile = new File([file], `thumbnail-${Date.now()}.${extension}`, {
        type: file.type,
      });

      setThumbnail(newFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(newFile);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  const handleSave = async () => {
    // ✅ Check permission
    if (!permissions?.can_create) {
      showError("You do not have permission to create courses");
      return;
    }

    if (!courseName.trim()) {
      showWarning("Course name cannot be empty.");
      return;
    }

    const result = await confirmAction({
      title: "Save this course?",
      text: `Course name: ${courseName}`,
      confirmButtonText: "Yes, save it!",
    });

    if (!result.isConfirmed) return;

    try {
      showLoading("Saving course...");
      const deviceInfo = getDeviceInfo();
      const formData = new FormData();
      formData.append("course_title", courseName);
      formData.append("course_description", courseDescription);
      formData.append("is_active", isActive.toString());
      formData.append("created_by", dataKaryawan?.nama || "System");
      formData.append("created_device", deviceInfo.device || "Unknown");

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      await onSave(formData);
      await showSuccess("Course saved successfully!");

      resetForm();
    } catch (error) {
      showError("Failed to save course: " + error.message);
    }
  };

  const handleDelete = async (courseId) => {
    // ✅ Check permission
    if (!permissions?.can_delete) {
      showError("You do not have permission to delete courses");
      return;
    }

    const result = await confirmAction({
      title: "Are you sure you want to delete this course?",
      text: "This action cannot be undone.",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      showLoading("Deleting course...");
      await onDelete(courseId);
      if (onDeleteContentSuccess) {
        await onDeleteContentSuccess();
      }
      await showSuccess("Course deleted successfully!");
    } catch (error) {
      showError("Failed to delete course: " + error.message);
    }
  };

  const handleDeleteContent = async (contentId) => {
    // ✅ Check permission
    if (!permissions?.can_delete) {
      showError("You do not have permission to delete content");
      return;
    }

    const result = await confirmAction({
      title: "Are you sure you want to delete this content?",
      text: "This action cannot be undone.",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      showLoading("Deleting content...");
      await onDeleteContent(contentId);
      if (onDeleteContentSuccess) {
        await onDeleteContentSuccess();
      }
      await showSuccess("Content deleted successfully!");
    } catch (error) {
      showError("Failed to delete content: " + error.message);
    }
  };

  const handleAddContent = (courseId) => {
    // ✅ Check permission
    if (!permissions?.can_create) {
      showError("You do not have permission to add content");
      return;
    }
    onAddContent(courseId);
  };

  const handleEditContent = (courseId, contentId, contentTypeId) => {
    // ✅ Check permission
    if (!permissions?.can_edit) {
      showError("You do not have permission to edit content");
      return;
    }
    onEditContent(courseId, contentId, contentTypeId);
  };

  const handleViewContent = (courseId, contentId, contentTypeId) => {
    // ✅ Check permission
    if (!permissions?.can_view) {
      showError("You do not have permission to view content");
      return;
    }
    onViewContent(courseId, contentId, contentTypeId);
  };

  const handleDuplicateTest = async (
    courseId,
    contentId,
    currentTypeId,
    currentTypeName
  ) => {
    if (!permissions?.can_create) {
      showError("You do not have permission to duplicate content");
      return;
    }

    // Determine target type based on current type
    const targetTypeId = 7; // Assuming 7 is the ID for Post Test
    const targetTypeName = "Post Test";

    const result = await confirmAction({
      title: `Duplicate as ${targetTypeName}?`,
      text: `This will create a copy of "${currentTypeName}" as ${targetTypeName}`,
      confirmButtonText: "Yes, duplicate it!",
      icon: "question",
    });

    if (!result.isConfirmed) return;

    try {
      showLoading(`Duplicating to ${targetTypeName}...`);

      // Call parent handler dengan target type id
      await onDuplicateTest({
        courseId,
        contentId,
        targetTypeId,
        targetTypeName,
      });

      // Refresh data
      if (onDeleteContentSuccess) {
        await onDeleteContentSuccess();
      }

      await showSuccess(`Successfully duplicated as ${targetTypeName}!`);
    } catch (error) {
      showError("Failed to duplicate test: " + error.message);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const resetForm = () => {
    setCourseName("");
    setCourseDescription("");
    setThumbnail(null);
    setThumbnailPreview(null);
    setIsActive(true);
    setIsModalOpen(false);
  };

  const isCoursePublished = (course) => {
    const now = new Date();
    const publishDate = course.publish_date
      ? new Date(course.publish_date)
      : null;
    const endDate = course.end_date ? new Date(course.end_date) : null;
    return publishDate && endDate && now >= publishDate && now <= endDate;
  };

  const stats = {
    total: courses.length,
    published: courses.filter((c) => isCoursePublished(c)).length,
    unpublished: courses.filter((c) => !isCoursePublished(c)).length,
    totalContent: courses.reduce(
      (sum, c) => sum + (c.contents?.length || 0),
      0
    ),
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.course_description &&
        course.course_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "published" && isCoursePublished(course)) ||
      (filterStatus === "unpublished" && !isCoursePublished(course));
    return matchesSearch && matchesFilter;
  });

  const getContentIcon = (contentTypeName) => {
    const name = contentTypeName?.toLowerCase() || "";
    if (name.includes("video")) return <Video className="w-4 h-4" />;
    if (name.includes("test") || name.includes("quiz"))
      return <ClipboardList className="w-4 h-4" />;
    return <FileCheck className="w-4 h-4" />;
  };

  const getContentColor = (contentTypeName) => {
    const name = contentTypeName?.toLowerCase() || "";
    if (name.includes("video")) return "bg-purple-100 text-purple-600";
    if (name.includes("test") || name.includes("quiz"))
      return "bg-blue-100 text-blue-600";
    return "bg-gray-100 text-gray-600";
  };

  // ✅ No permission check - Just show read-only view
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Total Courses
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Published
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.published}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Unpublished
                  </p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.unpublished}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <GlobeLock className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Total Content
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalContent}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  filterStatus === "all"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("published")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  filterStatus === "published"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Published
              </button>
              <button
                onClick={() => setFilterStatus("unpublished")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  filterStatus === "unpublished"
                    ? "bg-white text-gray-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Unpublished
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>

            {/* ✅ Create Course Button - Conditional Render */}
            {permissions?.can_create && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                                         hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Create Course</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredCourses.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {courses.length}
            </span>{" "}
            courses
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Course List */}
      {isLoading ? (
        <div className="space-y-3">
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id_course}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Course Header */}
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleCourse(course.id_course)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    {expandedCourse === course.id_course ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-blue-50 flex-shrink-0">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.course_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {course.course_title}
                      </h3>

                      {course.contents && course.contents.length > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {course.contents.length}
                        </span>
                      )}
                    </div>

                    {course.course_description && (
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {course.course_description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {(() => {
                    const now = new Date();
                    const publishDate = course.publish_date
                      ? new Date(course.publish_date)
                      : null;
                    const endDate = course.end_date
                      ? new Date(course.end_date)
                      : null;
                    const isPublished =
                      publishDate &&
                      endDate &&
                      now >= publishDate &&
                      now <= endDate;

                    return (
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          isPublished
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {isPublished ? (
                          <>
                            <Globe className="w-3.5 h-3.5" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <GlobeLock className="w-3.5 h-3.5" />
                            <span>Unpublished</span>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* ✅ Manage Button - Conditional based on create or edit permission */}
                  {(permissions?.can_create || permissions?.can_edit) && (
                    <button
                      onClick={() => handleAddContent(course.id_course)}
                      className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 
                                                     rounded-lg transition-colors border border-blue-200 font-medium text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Manage</span>
                    </button>
                  )}

                  {/* ✅ Delete Button - Conditional */}
                  {permissions?.can_delete && (
                    <button
                      onClick={() => handleDelete(course.id_course)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Content List */}
              {expandedCourse === course.id_course &&
                course.contents &&
                course.contents.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Course Contents ({course.contents.length})
                      </h4>
                    </div>
                    {course.contents.map((content, index) => (
                      <div
                        key={content.id_course_content}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-white transition-colors ${
                          index !== course.contents.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 text-gray-400 cursor-move hover:text-gray-600 hover:bg-gray-100 rounded">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="8" cy="6" r="1.5" />
                              <circle cx="8" cy="12" r="1.5" />
                              <circle cx="8" cy="18" r="1.5" />
                              <circle cx="16" cy="6" r="1.5" />
                              <circle cx="16" cy="12" r="1.5" />
                              <circle cx="16" cy="18" r="1.5" />
                            </svg>
                          </div>

                          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-700">
                              {index + 1}
                            </span>
                          </div>

                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-lg ${getContentColor(
                              content.content_type_name
                            )}`}
                          >
                            {getContentIcon(content.content_type_name)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {content.content_name ||
                                  content.content_type_name}
                              </span>
                              {content.is_mandatory && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 font-medium">
                                {content.content_type_name}
                              </span>
                              {content.duration && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs text-gray-500">
                                    {content.duration} mins
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content Actions */}
                        <div className="flex items-center gap-2">
                          {/* ✅ Edit Button - Conditional */}
                          {permissions?.can_view && (
                            <button
                              onClick={() =>
                                handleViewContent(
                                  course.id_course,
                                  content.id_course_content,
                                  content.id_content_type
                                )
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View content"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {permissions?.can_edit && (
                            <button
                              onClick={() =>
                                handleEditContent(
                                  course.id_course,
                                  content.id_course_content,
                                  content.id_content_type
                                )
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit content"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {permissions?.can_create &&
                            (content.id_content_type === 3 ||
                              content.id_content_type === 8) && (
                              <button
                                onClick={() =>
                                  handleDuplicateTest(
                                    course.id_course,
                                    content.id_course_content,
                                    content.id_content_type,
                                    content.content_type_name
                                  )
                                }
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                                title={`Duplicate as ${
                                  content.id_content_type === 3
                                    ? "Posttest"
                                    : "Pretest"
                                }`}
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            )}

                          {/* ✅ Delete Button - Conditional */}
                          {permissions?.can_delete && (
                            <button
                              onClick={() =>
                                handleDeleteContent(content.id_course_content)
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete content"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Empty State */}
              {expandedCourse === course.id_course &&
                (!course.contents || course.contents.length === 0) && (
                  <div className="border-t border-gray-100 bg-gray-50 px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900 mb-2">
                      No content yet
                    </h4>
                    <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
                      Start building your course by adding videos, documents, or
                      quizzes
                    </p>

                    {/* ✅ Add Content Button - Conditional */}
                    {permissions?.can_create && (
                      <button
                        onClick={() => handleAddContent(course.id_course)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm 
                                                     font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <Plus className="w-5 h-5" />
                        Add Content
                      </button>
                    )}
                  </div>
                )}
            </div>
          ))}
        </div>
      ) : (
        // Grid View - Similar permission checks
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id_course}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-40 bg-blue-50">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.course_title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-blue-400" />
                  </div>
                )}

                <div className="absolute top-3 right-3">
                  {(() => {
                    const now = new Date();
                    const publishDate = course.publish_date
                      ? new Date(course.publish_date)
                      : null;
                    const endDate = course.end_date
                      ? new Date(course.end_date)
                      : null;
                    const isPublished =
                      publishDate &&
                      endDate &&
                      now >= publishDate &&
                      now <= endDate;

                    return (
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isPublished
                            ? "bg-green-600 text-white"
                            : "bg-gray-700 text-white"
                        }`}
                      >
                        {isPublished ? (
                          <>
                            <Globe className="w-3 h-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <GlobeLock className="w-3 h-3" />
                            <span>Unpublished</span>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {course.contents && course.contents.length > 0 && (
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                      <FileText className="w-3 h-3" />
                      <span>{course.contents.length}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.course_title}
                </h3>

                {course.course_description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {course.course_description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-4">
                  {/* ✅ Manage Button - Conditional */}
                  {(permissions?.can_create || permissions?.can_edit) && (
                    <button
                      onClick={() => handleAddContent(course.id_course)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 
                                                     hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 font-medium text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Manage</span>
                    </button>
                  )}

                  {/* ✅ Delete Button - Conditional */}
                  {permissions?.can_delete && (
                    <button
                      onClick={() => handleDelete(course.id_course)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                      title="Delete course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm
              ? "Try adjusting your search terms or filters"
              : "Get started by creating your first course"}
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm("")}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-blue-600 hover:bg-blue-50 
                                     rounded-lg font-medium transition-colors border border-blue-200"
            >
              <X className="w-5 h-5" />
              Clear search
            </button>
          ) : (
            permissions?.can_create && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg 
                                         hover:bg-blue-700 font-medium transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Create Course
              </button>
            )
          )}
        </div>
      )}

      {/* Create Course Modal - Same as before, no changes needed */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Create New Course
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Fill in the details to create your course
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                                            focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm"
                  placeholder="e.g., Introduction to Web Development"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Description
                </label>
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                                            focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none text-sm"
                  placeholder="Describe what students will learn..."
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-900 block">
                      Activate Course
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Course will be visible to students
                    </p>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Thumbnail
                </label>

                {thumbnailPreview ? (
                  <div className="relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 group">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={removeThumbnail}
                          className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                        <Upload className="w-7 h-7 text-blue-600" />
                      </div>
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold text-blue-600">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or JPEG (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50 rounded-b-lg sticky bottom-0">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg
                                        hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !courseName.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg
                                        hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm
                                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Create Course</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
