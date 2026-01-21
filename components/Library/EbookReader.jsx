import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize,
  Minimize,
  Star,
} from "lucide-react";
import PdfViewer from "@/components/Library/PdfViewer";

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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // Next button timer state
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [countdown, setCountdown] = useState(5);

  const hasAutoSaved = useRef(false);
  const readerContainerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Detect iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  // Calculate responsive scale based on window width
  const getResponsiveScale = () => {
    // Responsive scaling untuk SEMUA mode (fullscreen dan normal)
    // if (windowWidth < 360) return 0.7; // Extra small phones
    // if (windowWidth < 375) return 0.75; // iPhone SE, etc
    // if (windowWidth < 390) return 0.95; // iPhone 12 Mini, etc

    return 1; // Desktop tetap 100%
  };

  // Listen to window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hide resume notification after 3 seconds
  useEffect(() => {
    if (showResumeNotification) {
      const timer = setTimeout(() => {
        setShowResumeNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showResumeNotification]);

  // Countdown timer for next button (hidden from UI)
  useEffect(() => {
    setIsNextDisabled(true);
    setCountdown(5);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsNextDisabled(false);
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [currentPage]);

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

        if (!forceComplete && !showReviewModal) {
          setShowReviewModal(true);
        }
      } else if (updateProgressFn) {
        await updateProgressFn(logId, currentPage, totalPages, {
          userId: "current_user_id",
          device: getDeviceInfo(),
        });
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
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
    }
  };

  // Go to next page
  const handleNextPage = () => {
    if (currentPage < totalPages && !isNextDisabled) {
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
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

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

  // ✅ Toggle fullscreen - CSS-based only (FIXED & iOS Compatible)
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // ENTER fullscreen
      setIsFullscreen(true);
      document.body.style.overflow = "hidden";

      // iOS specific - prevent body scroll
      if (isIOS()) {
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.height = "100%";

        // Hide Safari UI on iOS
        if (window.scrollTo) {
          setTimeout(() => {
            window.scrollTo(0, 1);
          }, 100);
        }
      }
    } else {
      // EXIT fullscreen
      setIsFullscreen(false);
      document.body.style.overflow = "";

      // iOS specific - restore body
      if (isIOS()) {
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.height = "";
      }
    }
  };

  // ❌ REMOVED: useEffect fullscreenchange listener yang menyebabkan bug

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "ArrowRight" && !isNextDisabled) {
        handleNextPage();
      } else if (event.key === "ArrowLeft") {
        handlePrevPage();
      } else if (event.key === "f" || event.key === "F") {
        toggleFullscreen();
      } else if (event.key === "Escape" && isFullscreen) {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, isNextDisabled, totalPages, isFullscreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Restore body styles on unmount
      document.body.style.overflow = "";

      // iOS specific cleanup
      if (isIOS()) {
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.height = "";
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      {/* Resume Reading Notification */}
      {showResumeNotification && (
        <div
          className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg z-50 animate-fade-in"
          style={{ zIndex: 100 }}
        >
          <p className="text-xs md:text-sm font-medium">
            ✨ Welcome back! Resuming from page {ebook.resumePage}
          </p>
        </div>
      )}

      {/* Container with ref for fullscreen */}
      <div
        ref={readerContainerRef}
        className={`w-full h-full ${
          isFullscreen
            ? "fixed inset-0 z-[9999]"
            : "relative max-w-7xl max-h-[90vh]"
        }`}
        style={
          isFullscreen
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 9999,
                backgroundColor: "#000",
              }
            : {}
        }
      >
        {/* Header Controls - Hidden in fullscreen */}
        {!isFullscreen && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-3 md:p-6 z-30">
            <div className="flex items-center justify-between">
              {/* Title */}
              <div className="flex-1 min-w-0 mr-4">
                <h1 className="text-white text-base md:text-xl lg:text-2xl font-bold truncate">
                  {ebook.title}
                </h1>
                {ebook.author && (
                  <p className="text-white/80 text-xs md:text-sm truncate">
                    by {ebook.author}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                {/* Auto-save indicator */}
                {isSaving && (
                  <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-blue-500/90 text-white rounded-lg">
                    <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                    <span className="text-xs md:text-sm hidden md:inline">
                      Saving...
                    </span>
                  </div>
                )}

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 md:p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
                  title={
                    isIOS()
                      ? "Toggle Fullscreen View"
                      : "Toggle Fullscreen (F key)"
                  }
                >
                  <Maximize size={18} className="md:w-5 md:h-5" />
                </button>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  disabled={isSaving}
                  className="p-2 md:p-2.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors backdrop-blur-sm disabled:opacity-50"
                  title="Close eBook"
                >
                  <X size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reader Area */}
        <div
          className="relative w-full h-full"
          style={{
            background:
              windowWidth < 585
                ? "white"
                : "linear-gradient(to bottom right, #111827, #1f2937, #111827)",
          }}
        >
          {/* Previous Button */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`absolute left-0 md:left-4 top-1/2 -translate-y-1/2 w-12 h-16 md:w-12 md:h-12 rounded-r-full md:rounded-full disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center group z-20 ${
              windowWidth < 585
                ? "bg-gradient-to-r from-gray-900/5 to-gray-100/5 hover:from-gray-900/10 hover:to-gray-100/5"
                : isFullscreen
                ? "bg-white/90 hover:bg-white shadow-lg hover:shadow-xl"
                : "bg-white shadow-lg hover:shadow-xl"
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft
              size={20}
              className={`md:w-6 md:h-6 transition-colors group-disabled:text-gray-400 ${
                windowWidth < 585
                  ? "text-gray-500 group-hover:text-blue-600 ml-1"
                  : "text-gray-700 group-hover:text-blue-600"
              }`}
            />
          </button>

          {/* eBook Display Area */}
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              overflow: "hidden",
              position: "relative",
              backgroundColor: "transparent",
            }}
          >
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                overflow: "auto",
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  transform: `scale(${getResponsiveScale()})`,
                  transformOrigin: "center center",
                  transition: "transform 0.3s ease",
                }}
              >
                {ebook.file_path_url ? (
                  <PdfViewer
                    file={`/api/pdf-proxy?url=${encodeURIComponent(
                      ebook.file_path_url
                    )}`}
                    currentPage={currentPage}
                    initialPage={ebook.resumePage || 1}
                    showControls={false}
                    onPageChange={(isLastPage) => {
                      if (isLastPage && currentPage >= totalPages) {
                        // Reached last page
                      }
                    }}
                    onError={(errorMsg) => {
                      console.error("PDF Error:", errorMsg);
                    }}
                  />
                ) : ebook.cover_image_url ? (
                  <div
                    className="w-full h-full flex items-center justify-center p-4 md:p-8"
                    style={{ pointerEvents: "auto" }}
                  >
                    <img
                      src={ebook.cover_image_url}
                      alt={ebook.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-center text-gray-500 p-6 md:p-12"
                    style={{ pointerEvents: "auto" }}
                  >
                    <div>
                      <div className="text-6xl md:text-8xl mb-4">📖</div>
                      <h2 className="text-xl md:text-2xl font-bold mb-2">
                        {ebook.title}
                      </h2>
                      <p className="text-base md:text-lg mb-4">
                        Page{" "}
                        <span className="font-bold text-blue-600">
                          {currentPage}
                        </span>{" "}
                        of {totalPages}
                      </p>
                      {ebook.author && (
                        <p className="text-gray-600 mb-4 text-sm md:text-base">
                          by {ebook.author}
                        </p>
                      )}
                      <div className="mt-8 text-xs md:text-sm text-gray-400">
                        Use arrow buttons or keyboard arrows (← →) to navigate
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isNextDisabled}
            className={`absolute right-0 md:right-4 top-1/2 -translate-y-1/2 w-12 h-16 md:w-12 md:h-12 rounded-l-full md:rounded-full disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center group z-20 ${
              windowWidth < 585
                ? "bg-gradient-to-l from-gray-900/5 to-gray-100/5 hover:from-gray-900/10 hover:to-gray-100/5"
                : isFullscreen
                ? "bg-white/90 hover:bg-white shadow-lg hover:shadow-xl"
                : "bg-white shadow-lg hover:shadow-xl"
            }`}
            aria-label="Next page"
          >
            <ChevronRight
              size={20}
              className={`md:w-6 md:h-6 transition-colors group-disabled:text-gray-400 ${
                windowWidth < 585
                  ? "text-gray-500 group-hover:text-blue-600 mr-1"
                  : "text-gray-700 group-hover:text-blue-600"
              }`}
            />
          </button>

          {/* Fullscreen Controls - Floating Header */}
          {isFullscreen && (
            <div className="absolute top-2 md:top-4 right-2 md:right-4 flex items-center gap-2 md:gap-3 z-30">
              {isSaving && (
                <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-black/70 text-white rounded-lg backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                  <span className="text-xs md:text-sm hidden md:inline">
                    Saving...
                  </span>
                </div>
              )}

              <button
                onClick={toggleFullscreen}
                className="p-2 md:p-2.5 bg-black/70 hover:bg-black/80 text-white rounded-lg transition-colors backdrop-blur-sm"
                title={
                  isIOS() ? "Exit Fullscreen View" : "Exit Fullscreen (F key)"
                }
              >
                <Minimize size={18} className="md:w-5 md:h-5" />
              </button>

              <button
                onClick={handleClose}
                disabled={isSaving}
                className="p-2 md:p-2.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors backdrop-blur-sm disabled:opacity-50"
                title="Close eBook"
              >
                <X size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
          )}

          {/* Page Counter */}
          <div
            className={`absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 backdrop-blur-sm px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-lg z-20 ${
              isFullscreen && windowWidth < 480
                ? "bg-black/20 text-white"
                : isFullscreen
                ? "bg-black/70 text-white"
                : "bg-white/95 text-gray-600"
            }`}
          >
            <span className="text-xs md:text-sm font-medium">
              Page{" "}
              <span
                className={`font-bold ${
                  isFullscreen && windowWidth < 480
                    ? "text-blue-300"
                    : isFullscreen
                    ? "text-blue-400"
                    : "text-blue-600"
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
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-2">
              Give Your Feedback
            </h2>
            <p className="text-center text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
              Thanks!
            </p>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 md:gap-3 mb-4 md:mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  type="button"
                >
                  <Star
                    size={40}
                    className={`md:w-12 md:h-12 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            {/* Comment Textarea */}
            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this ebook..."
                rows={4}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm md:text-base"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={handleSkipReview}
                disabled={isSubmittingReview}
                type="button"
                className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 text-sm md:text-base"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || rating === 0}
                type="button"
                className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
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
