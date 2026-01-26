import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Eye,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize,
  Minimize,
} from "lucide-react";
import { useEbooks } from "../../hooks/useEbooks";
import PdfViewer from "../../components/Library/PdfViewerTrainner";

export default function ViewEbook({ onBack, ebookId }) {
  const { getEbookDetailById, loading } = useEbooks();
  const [ebook, setEbook] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const readerContainerRef = useRef(null);

  useEffect(() => {
    if (ebookId) {
      loadEbook();
    }
  }, [ebookId]);

  const loadEbook = async () => {
    try {
      const data = await getEbookDetailById(ebookId);
      setEbook(data);
      setTotalPages(data.total_pages || 100);
    } catch (error) {
      console.error("Error loading ebook:", error);
      alert("Failed to load ebook details");
    }
  };

  const handleOpenViewer = () => {
    setIsViewerOpen(true);
    setCurrentPage(1);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setCurrentPage(1);
    if (isFullscreen) {
      setIsFullscreen(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const toggleFullscreen = async () => {
    // console.log("🖥️ Toggle fullscreen clicked, current:", isFullscreen);

    if (!isFullscreen) {
      // Enter fullscreen
      try {
        const element = readerContainerRef.current;
        if (element) {
          if (element.requestFullscreen) {
            await element.requestFullscreen();
          } else if (element.webkitRequestFullscreen) {
            await element.webkitRequestFullscreen();
          } else if (element.mozRequestFullScreen) {
            await element.mozRequestFullScreen();
          } else if (element.msRequestFullscreen) {
            await element.msRequestFullscreen();
          }
        }
        setIsFullscreen(true);
      } catch (err) {
        console.error("Error entering fullscreen:", err);
      }
    } else {
      // Exit fullscreen
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
      } catch (err) {
        console.error("Error exiting fullscreen:", err);
      }
    }
  };

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      setIsFullscreen(isCurrentlyFullscreen);
      //   console.log("🖥️ Fullscreen changed:", isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isViewerOpen) return;

    const handleKeyPress = async (e) => {
      if (e.key === "ArrowRight") {
        if (currentPage < totalPages) {
          setCurrentPage((prev) => prev + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } else if (e.key === "f" || e.key === "F") {
        // Toggle fullscreen
        if (!isFullscreen) {
          try {
            const element = readerContainerRef.current;
            if (element) {
              if (element.requestFullscreen) {
                await element.requestFullscreen();
              } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen();
              } else if (element.mozRequestFullScreen) {
                await element.mozRequestFullScreen();
              } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen();
              }
            }
          } catch (err) {
            console.error("Error entering fullscreen:", err);
          }
        } else {
          try {
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
              await document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
              await document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
              await document.msExitFullscreen();
            }
          } catch (err) {
            console.error("Error exiting fullscreen:", err);
          }
        }
      } else if (e.key === "Escape") {
        // ESC will automatically exit fullscreen if in fullscreen mode
        // If not in fullscreen, close the viewer
        if (!isFullscreen) {
          handleCloseViewer();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isViewerOpen, currentPage, totalPages, isFullscreen]);

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
                        {ebook.upload_date
                          ? new Date(ebook.upload_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
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
                              },
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

      {/* eBook Viewer Modal - Full Screen */}
      {isViewerOpen && (
        <div
          ref={readerContainerRef}
          className="fixed inset-0 bg-black z-[9999] flex flex-col"
          style={{
            overflow: "hidden",
            width: "100vw",
            height: "100vh",
          }}
        >
          {/* Header - Hidden in Fullscreen */}
          {!isFullscreen && (
            <div
              className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg"
              style={{ flexShrink: 0, height: "64px" }}
            >
              <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between h-full">
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                  <button
                    onClick={handleCloseViewer}
                    className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm md:text-base shrink-0"
                  >
                    <X size={18} className="md:w-5 md:h-5" />
                    <span className="hidden md:inline">Close</span>
                  </button>
                  <div className="h-4 md:h-6 w-px bg-white/30"></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm md:text-lg font-semibold truncate">
                      {ebook.title}
                    </h3>
                    <p className="text-xs text-blue-100 truncate hidden md:block">
                      {ebook.author || "Unknown Author"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <button
                    onClick={toggleFullscreen}
                    className="px-2 md:px-4 py-1.5 md:py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1 md:gap-2"
                    title="Fullscreen (F key)"
                  >
                    <Maximize size={16} className="md:w-5 md:h-5" />
                    <span className="hidden md:inline text-sm">Fullscreen</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Container */}
          <div
            className="relative bg-gray-900 flex-1"
            style={{
              overflow: "hidden",
            }}
          >
            {/* Prev Button */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center group z-20 ${
                isFullscreen ? "bg-white/90 hover:bg-white" : "bg-white"
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft
                size={20}
                className="md:w-6 md:h-6 text-gray-700 group-hover:text-blue-600 transition-colors group-disabled:text-gray-400"
              />
            </button>

            {/* eBook Display Area */}
            <div
              className="w-full h-full bg-white flex items-center justify-center"
              style={{
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  overflow: "auto",
                }}
              >
                {ebook.file_url ? (
                  <PdfViewer
                    file={`/api/pdf-proxy?url=${encodeURIComponent(
                      ebook.file_url,
                    )}`}
                    currentPage={currentPage}
                    initialPage={1}
                    showControls={false}
                    onLoadSuccess={(numPages) => {
                      setTotalPages(numPages);
                      //   console.log("✅ PDF loaded with", numPages, "pages");
                    }}
                    onPageChange={(isLastPage) => {
                      if (isLastPage && currentPage >= totalPages) {
                        // console.log("✅ Reached last page of PDF");
                      }
                    }}
                    onError={(errorMsg) => {
                      console.error("PDF Error:", errorMsg);
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-center text-gray-500 p-6 md:p-12"
                    style={{ pointerEvents: "auto" }}
                  >
                    <div>
                      <FileText className="w-16 h-16 mx-auto mb-4 text-red-400" />
                      <h2 className="text-xl md:text-2xl font-bold mb-2 text-red-600">
                        File Not Found
                      </h2>
                      <p className="text-base md:text-lg text-gray-600">
                        The eBook file is not available.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center group z-20 ${
                isFullscreen ? "bg-white/90 hover:bg-white" : "bg-white"
              }`}
              aria-label="Next page"
            >
              <ChevronRight
                size={20}
                className="md:w-6 md:h-6 text-gray-700 group-hover:text-blue-600 transition-colors group-disabled:text-gray-400"
              />
            </button>

            {/* Fullscreen Controls - Floating Header */}
            {isFullscreen && (
              <div className="absolute top-2 md:top-4 right-2 md:right-4 flex items-center gap-2 md:gap-3 z-30">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 md:p-2.5 bg-black/70 hover:bg-black/80 text-white rounded-lg transition-colors backdrop-blur-sm"
                  title="Exit Fullscreen (F key)"
                >
                  <Minimize size={18} className="md:w-5 md:h-5" />
                </button>

                <button
                  onClick={handleCloseViewer}
                  className="p-2 md:p-2.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors backdrop-blur-sm"
                  title="Close eBook"
                >
                  <X size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            )}

            {/* Page Counter */}
            <div
              className={`absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 backdrop-blur-sm px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-lg z-20 ${
                isFullscreen
                  ? "bg-black/70 text-white"
                  : "bg-white/95 text-gray-600"
              }`}
            >
              <span className="text-xs md:text-sm font-medium">
                Page{" "}
                <span
                  className={`font-bold ${
                    isFullscreen ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {currentPage}
                </span>{" "}
                of {totalPages}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
