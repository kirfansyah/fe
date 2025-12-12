import { useState, useEffect } from "react";
import { ArrowLeft, Eye, BookOpen, FileText } from "lucide-react";
import { useEbooks } from "../../hooks/useEbooks";

export default function ViewEbook({ onBack, ebookId }) {
  const { getEbookDetailById, loading } = useEbooks();
  const [ebook, setEbook] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    if (ebookId) {
      loadEbook();
    }
  }, [ebookId]);

  const loadEbook = async () => {
    try {
      const data = await getEbookDetailById(ebookId);
      setEbook(data);
    } catch (error) {
      console.error("Error loading ebook:", error);
      alert("Failed to load ebook details");
    }
  };

  const handleOpenViewer = () => {
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
  };

  if (loading) {
    return (
      <div className="mt-6 ml-2 grid grid-cols-1 gap-6">
        <div className="min-h-screen bg-white p-4 rounded-lg shadow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ebook...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="mt-6 ml-2 grid grid-cols-1 gap-6">
        <div className="min-h-screen bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500">eBook not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 ml-2 grid grid-cols-1 gap-6">
      <div className="min-h-screen bg-white rounded-lg shadow">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to List</span>
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                View eBook
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenViewer}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Read eBook</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-6">
            {/* Left Side - Cover Image */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="max-w-sm mx-auto bg-gray-100 rounded-lg overflow-hidden shadow-md">
                  {ebook.cover_image_url ? (
                    <img
                      src={ebook.cover_image_url}
                      alt={ebook.title}
                      className="w-full h-full h-auto max-h-100 object-cover"
                      //   style={{ aspectRatio: "3/4" }}
                      onError={(e) => {
                        e.target.src = "/images/default-book-cover.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <BookOpen className="w-24 h-24 text-blue-400" />
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Quick Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Format: PDF/EPUB</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Pages: {ebook.total_pages || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {ebook.title}
                  </h1>
                  <p className="text-lg text-gray-600">
                    by {ebook.author || "Unknown Author"}
                  </p>
                </div>

                {/* Category & Sub Category */}
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {ebook.category || "Category"}
                  </span>
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {ebook.subcategory || "Sub Category"}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <div
                    className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: ebook.description || "No description available.",
                    }}
                  />
                </div>

                {/* Additional Info */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 ms-3">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Publication Date
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {ebook.created_at
                          ? new Date(ebook.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                      <p className="text-base font-medium text-gray-900">
                        {ebook.updated_at
                          ? new Date(ebook.updated_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="text-base font-medium text-gray-900">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Published
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contents/Chapters (if available) */}
                {ebook.contents && ebook.contents.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Table of Contents
                    </h3>
                    <div className="space-y-2">
                      {ebook.contents.map((content, index) => (
                        <div
                          key={content.id_ebook_content}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-500 w-8">
                            {index + 1}.
                          </span>
                          <span className="text-sm text-gray-900">
                            {content.content_type_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* eBook Viewer Modal */}
      {isViewerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
          {/* Viewer Header */}
          <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCloseViewer}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Close Reader</span>
              </button>
              <h3 className="text-lg font-semibold">{ebook.title}</h3>
            </div>
          </div>

          {/* Viewer Content */}
          <div className="flex-1 overflow-hidden">
            {ebook.file_url ? (
              <iframe
                src={`/api/proxy/proxy-pdf?url=${encodeURIComponent(
                  ebook.file_url
                )}`}
                className="w-full h-full"
                title={ebook.title}
                style={{ border: "none" }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl mb-2">eBook file not available</p>
                  <p className="text-gray-400">
                    The eBook file cannot be displayed in the viewer.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
