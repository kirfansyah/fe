import {
  BookOpen,
  Calendar,
  User,
  FileText,
  Star,
  Eye,
  Clock,
  ArrowLeft,
  BookOpenCheck,
  Tag,
  Upload,
  UserCircle,
  TrendingUp,
} from "lucide-react";

export default function EbookDescription({
  ebookDescription,
  onClose,
  onReadEbook,
}) {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 px-3 md:py-6 md:px-6">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white/90 hover:text-white mb-3 md:mb-4 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Library</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold leading-tight">
          {ebookDescription.title}
        </h1>
      </div>

      {/* Content */}
      <div className="p-3 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Left Sidebar - Ebook Info Card */}
          <div className="w-full md:w-64 md:flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden md:sticky md:top-6">
              {/* Cover Image */}
              <div className="w-full">
                {ebookDescription.cover_image_url ? (
                  <img
                    src={ebookDescription.cover_image_url}
                    alt={ebookDescription.title}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <BookOpen size={48} className="mx-auto mb-2" />
                      <div className="text-xs">No Cover</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ebook Details */}
              <div className="p-3 md:p-4 space-y-3">
                {/* Category & Sub Category */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 group">
                    <Tag className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">
                        Category
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {ebookDescription.category_name || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 group">
                    <Tag className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">
                        Sub Category
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {ebookDescription.subcategory_name || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Author */}
                <div className="flex items-start gap-2 group">
                  <UserCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">Author</div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {ebookDescription.author || "-"}
                    </div>
                  </div>
                </div>

                {/* Pages */}
                <div className="flex items-start gap-2 group">
                  <FileText className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">Pages</div>
                    <div className="text-sm font-medium text-gray-900">
                      {ebookDescription.total_pages || "-"} pages
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Upload Info */}
                <div className="flex items-start gap-2 group">
                  <Upload className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">
                      Uploaded by
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {ebookDescription.upload_by ||
                        ebookDescription.created_by ||
                        "-"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 group">
                  <Calendar className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">
                      Upload Date
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(
                        ebookDescription.upload_date ||
                          ebookDescription.created_at,
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Stats */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-600">Rating</div>
                      <div className="text-lg font-bold text-gray-900">
                        {ebookDescription.rating || "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <div className="text-xs text-gray-600">Total Read</div>
                    </div>
                    <div className="text-base font-bold text-gray-900">
                      {ebookDescription.total_read || "-"}
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-2.5 border border-purple-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <div className="text-xs text-gray-600">Read Hours</div>
                    </div>
                    <div className="text-base font-bold text-gray-900">
                      {ebookDescription.total_reading_hours ||
                        ebookDescription.total_time ||
                        "-"}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-3 md:px-4 pb-3 md:pb-4">
                  <div className="space-y-2 hidden md:block">
                    <button
                      onClick={onReadEbook}
                      className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <BookOpenCheck className="w-4 h-4" />
                      Read eBook
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full px-4 py-2.5 bg-cyan-400 text-white text-sm font-medium rounded hover:bg-cyan-500 transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Description */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Header */}
              <div className="px-3 py-3 md:px-6 md:py-4 border-b border-gray-200">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  E-Book Description
                </h2>
              </div>

              {/* Description Content */}
              <div className="px-3 py-4 md:px-6 md:py-6">
                {ebookDescription.description ? (
                  <div
                    className="text-gray-700 text-[15px] leading-relaxed 
                    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-gray-900
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-gray-900
                    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-gray-900
                    [&_p]:mb-4 [&_p]:leading-relaxed
                    [&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2
                    [&_ol]:mb-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-2
                    [&_strong]:font-semibold [&_strong]:text-gray-900
                    [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-700"
                    dangerouslySetInnerHTML={{
                      __html: ebookDescription.description,
                    }}
                  />
                ) : (
                  <div className="text-gray-700 text-[15px] leading-relaxed space-y-4">
                    <p>
                      <strong>No Description</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Popup - Mobile & Tablet */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-3">
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-cyan-400 text-white text-sm font-medium rounded hover:bg-cyan-500 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onReadEbook}
            className="flex-1 px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <BookOpenCheck className="w-4 h-4" />
            Read eBook
          </button>
        </div>
      </div>

      {/* Spacer for fixed bottom popup */}
      <div className="md:hidden h-20" />
    </div>
  );
}
