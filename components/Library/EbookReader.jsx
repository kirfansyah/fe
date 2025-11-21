import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize,
  Minimize,
  Star,
} from "lucide-react";

export default function EbookReader({
  ebook,
  logId = null,
  onClose,
  updateProgressFn,
  completeReadingFn,
  submitReviewFn,
}) {
  const [currentPage, setCurrentPage] = useState(ebook.resumePage || 1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [totalPages, setTotalPages] = useState(ebook.total_pages || 100);
  const [isSaving, setIsSaving] = useState(false);
  const [showResumeNotification, setShowResumeNotification] = useState(
    ebook.isResume || false
  );
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const hasAutoSaved = useRef(false);
  const iframeRef = useRef(null);
  const readerContainerRef = useRef(null);

  // Hide resume notification after 3 seconds
  useEffect(() => {
    if (showResumeNotification) {
      const timer = setTimeout(() => {
        setShowResumeNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showResumeNotification]);

  // Auto-save progress every 5 seconds
  useEffect(() => {
    if (!logId || !updateProgressFn) return;

    const interval = setInterval(() => {
      saveProgress(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [logId, currentPage, updateProgressFn]);

  // Save progress function
  const saveProgress = async (isClosing = false, forceComplete = false) => {
    if (!logId) {
      console.warn("⚠️ No log ID available, skipping save");
      return;
    }

    if (hasAutoSaved.current && !isClosing && !forceComplete) {
      return;
    }

    hasAutoSaved.current = true;
    setIsSaving(true);

    try {
      const isCompleted = forceComplete || currentPage >= totalPages;

      if (isCompleted && completeReadingFn) {
        await completeReadingFn(logId, currentPage, {
          userId: "current_user_id",
          device: getDeviceInfo(),
        });
        console.log("✅ Reading completed, saved page:", currentPage);

        if (!forceComplete && !showReviewModal) {
          setShowReviewModal(true);
        }
      } else if (updateProgressFn) {
        await updateProgressFn(logId, currentPage, totalPages, {
          userId: "current_user_id",
          device: getDeviceInfo(),
        });
        console.log("✅ Progress saved, page:", currentPage);
      }
    } catch (error) {
      console.error("❌ Failed to save progress:", error);
    } finally {
      setIsSaving(false);
      if (!isClosing && !forceComplete) {
        setTimeout(() => {
          hasAutoSaved.current = false;
        }, 1000);
      }
    }
  };

  // Get device info
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    let deviceType = "Desktop";

    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      )
    ) {
      deviceType = "Mobile";
    } else if (/iPad|Android/i.test(userAgent)) {
      deviceType = "Tablet";
    }

    return `${deviceType} - ${navigator.platform}`;
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      hasAutoSaved.current = false;
      console.log("📖 Page changed to:", newPage);
    }
  };

  // Go to next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Go to previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Handle close
  const handleClose = async () => {
    await saveProgress(true, false);

    if (currentPage >= totalPages && !showReviewModal) {
      setShowReviewModal(true);
    } else {
      onClose(currentPage, totalPages, true);
    }
  };

  // Handle submit review
  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (submitReviewFn) {
        await submitReviewFn(ebook.id_ebook, rating, comment, {
          userId: "current_user_id",
          device: getDeviceInfo(),
        });
        console.log("⭐ Review submitted successfully");
      }

      await saveProgress(true, true);

      alert("Thank you for your feedback!");
      setShowReviewModal(false);
      onClose(currentPage, totalPages, true);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Skip review
  const handleSkipReview = async () => {
    await saveProgress(true, true);
    setShowReviewModal(false);
    onClose(currentPage, totalPages, true);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (readerContainerRef.current) {
        if (readerContainerRef.current.requestFullscreen) {
          readerContainerRef.current.requestFullscreen().catch((err) => {
            console.error("Error attempting to enable fullscreen:", err);
          });
        } else if (readerContainerRef.current.webkitRequestFullscreen) {
          readerContainerRef.current.webkitRequestFullscreen();
        } else if (readerContainerRef.current.mozRequestFullScreen) {
          readerContainerRef.current.mozRequestFullScreen();
        } else if (readerContainerRef.current.msRequestFullscreen) {
          readerContainerRef.current.msRequestFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error("Error attempting to exit fullscreen:", err);
        });
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isNowFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showReviewModal) return;

      if (e.key === "ArrowLeft") {
        handlePrevPage();
      } else if (e.key === "ArrowRight") {
        handleNextPage();
      } else if (e.key === "Escape" && !isFullscreen) {
        handleClose();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, isFullscreen, showReviewModal]);

  // Disable body scroll when reader is open
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyHeight = document.body.style.height;
    const originalHtmlHeight = document.documentElement.style.height;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.documentElement.style.height = "100vh";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.height = originalBodyHeight;
      document.documentElement.style.height = originalHtmlHeight;
    };
  }, []);

  return (
    <div
      ref={readerContainerRef}
      className="fixed inset-0 bg-black z-[9999]"
      style={{
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Header - Hidden in Fullscreen */}
      {!isFullscreen && (
        <div
          className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg"
          style={{ flexShrink: 0 }}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors font-medium"
              >
                Home
              </button>
              <div className="h-6 w-px bg-white/30"></div>
              <h1 className="text-lg font-semibold truncate max-w-md">
                {ebook.title || "eBook Reader"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {isSaving && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Saving...</span>
                </div>
              )}

              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <Maximize size={18} />
                <span className="text-sm font-medium">Full Screen</span>
              </button>

              <button
                onClick={handleClose}
                disabled={isSaving}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <X size={18} />
                <span className="text-sm font-medium">Exit eBook</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Notification */}
      {showResumeNotification && !isFullscreen && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <span className="text-lg">📖</span>
            <span className="font-medium">
              Resumed from page {ebook.resumePage}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          height: isFullscreen ? "100vh" : "calc(100vh - 76px)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ overflow: "hidden" }}
        >
          {/* Previous Button */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center group z-20 ${
              isFullscreen ? "bg-white/90 hover:bg-white" : "bg-white"
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft
              size={24}
              className="text-gray-700 group-hover:text-blue-600 transition-colors group-disabled:text-gray-400"
            />
          </button>

          {/* eBook Display Area */}
          <div
            className="w-full h-full bg-white"
            style={{
              overflow: "hidden",
              maxWidth: isFullscreen ? "100%" : "80rem",
              padding: isFullscreen ? "0" : "0 80px",
            }}
          >
            {ebook.file_path_url ? (
              <iframe
                ref={iframeRef}
                key={currentPage}
                src={`${ebook.file_path_url}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=Fit&zoom=page-fit`}
                className="w-full h-full border-0"
                title="eBook Content"
                style={{
                  overflow: "hidden",
                  display: "block",
                  border: "none",
                }}
                scrolling="no"
              />
            ) : ebook.cover_image_url ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <img
                  src={ebook.cover_image_url}
                  alt={ebook.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-center text-gray-500 p-12">
                <div>
                  <div className="text-8xl mb-4">📖</div>
                  <h2 className="text-2xl font-bold mb-2">{ebook.title}</h2>
                  <p className="text-lg mb-4">
                    Page{" "}
                    <span className="font-bold text-blue-600">
                      {currentPage}
                    </span>{" "}
                    of {totalPages}
                  </p>
                  {ebook.author && (
                    <p className="text-gray-600 mb-4">by {ebook.author}</p>
                  )}
                  <div className="mt-8 text-sm text-gray-400">
                    Use arrow buttons or keyboard arrows (← →) to navigate
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center group z-20 ${
              isFullscreen ? "bg-white/90 hover:bg-white" : "bg-white"
            }`}
            aria-label="Next page"
          >
            <ChevronRight
              size={24}
              className="text-gray-700 group-hover:text-blue-600 transition-colors group-disabled:text-gray-400"
            />
          </button>

          {/* Fullscreen Controls - Floating Header */}
          {isFullscreen && (
            <div className="absolute top-4 right-4 flex items-center gap-3 z-30">
              {isSaving && (
                <div className="flex items-center gap-2 px-3 py-2 bg-black/70 text-white rounded-lg backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Saving...</span>
                </div>
              )}

              <button
                onClick={toggleFullscreen}
                className="p-2.5 bg-black/70 hover:bg-black/80 text-white rounded-lg transition-colors backdrop-blur-sm"
                title="Exit Fullscreen (F key)"
              >
                <Minimize size={20} />
              </button>

              <button
                onClick={handleClose}
                disabled={isSaving}
                className="p-2.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors backdrop-blur-sm disabled:opacity-50"
                title="Close eBook"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Page Counter */}
          <div
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 backdrop-blur-sm px-6 py-2.5 rounded-full shadow-lg z-20 ${
              isFullscreen
                ? "bg-black/70 text-white"
                : "bg-white/95 text-gray-600"
            }`}
          >
            <span className="text-sm font-medium">
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

      {/* Review Modal */}
      {showReviewModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 10000 }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Give Your Feedback
            </h2>
            <p className="text-center text-gray-600 mb-6">Thanks!</p>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  type="button"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            {/* Comment Textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this ebook..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSkipReview}
                disabled={isSubmittingReview}
                type="button"
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || rating === 0}
                type="button"
                className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
