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

  // Next button timer state
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [countdown, setCountdown] = useState(5);

  const hasAutoSaved = useRef(false);
  const readerContainerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Hide resume notification after 3 seconds
  useEffect(() => {
    if (showResumeNotification) {
      const timer = setTimeout(() => {
        setShowResumeNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showResumeNotification]);

  // Countdown timer for next button
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
      } else if (e.key === "ArrowRight" && !isNextDisabled) {
        handleNextPage();
      } else if (e.key === "Escape" && !isFullscreen) {
        handleClose();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, isFullscreen, showReviewModal, isNextDisabled]);

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

  // Prevent wheel scroll
  useEffect(() => {
    const preventScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const container = readerContainerRef.current;
    if (container) {
      container.addEventListener("wheel", preventScroll, { passive: false });
      container.addEventListener("touchmove", preventScroll, {
        passive: false,
      });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", preventScroll);
        container.removeEventListener("touchmove", preventScroll);
      }
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
        touchAction: "none", // Disable touch scrolling
      }}
    >
      {/* Header - Hidden in Fullscreen */}
      {!isFullscreen && (
        <div
          className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg"
          style={{ flexShrink: 0 }}
        >
          <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors font-medium text-sm md:text-base"
              >
                Home
              </button>
              <div className="h-4 md:h-6 w-px bg-white/30"></div>
              <h1 className="text-sm md:text-lg font-semibold truncate max-w-[150px] md:max-w-md">
                {ebook.title || "eBook Reader"}
              </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {isSaving && (
                <div className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-white/20 rounded-lg">
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                  <span className="text-xs md:text-sm hidden md:inline">
                    Saving...
                  </span>
                </div>
              )}

              <button
                onClick={toggleFullscreen}
                className="px-2 md:px-4 py-1.5 md:py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1 md:gap-2"
              >
                <Maximize size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="text-xs md:text-sm font-medium hidden sm:inline">
                  Full Screen
                </span>
              </button>

              <button
                onClick={handleClose}
                disabled={isSaving}
                className="px-2 md:px-4 py-1.5 md:py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-1 md:gap-2 disabled:opacity-50"
              >
                <X size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="text-xs md:text-sm font-medium hidden sm:inline">
                  Exit
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Notification */}
      {showResumeNotification && !isFullscreen && (
        <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <span className="text-base md:text-lg">📖</span>
            <span className="font-medium text-sm md:text-base">
              Resumed from page {ebook.resumePage}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          height: isFullscreen ? "100vh" : "calc(100vh - 60px)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center relative"
          style={{ overflow: "hidden" }}
        >
          {/* Previous Button - Moved to center */}
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

          {/* eBook Display Area - Fit to Screen */}
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
              {ebook.file_path_url ? (
                <PdfViewer
                  file={`/api/pdf-proxy?url=${encodeURIComponent(
                    ebook.file_path_url
                  )}`}
                  currentPage={currentPage}
                  initialPage={ebook.resumePage || 1}
                  showControls={false}
                  onPageChange={(isLastPage) => {
                    // Handle jika sudah di halaman terakhir PDF
                    if (isLastPage && currentPage >= totalPages) {
                      console.log("✅ Reached last page of PDF");
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

          {/* Next Button - Moved to center */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isNextDisabled}
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
                title="Exit Fullscreen (F key)"
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

      {/* Review Modal - 5 Stars */}
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

            {/* Star Rating - 5 Stars Only */}
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
