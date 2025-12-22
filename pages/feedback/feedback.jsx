import { useState, useEffect } from "react";
import Admin from "layouts/Admin.js";
import {
  ChevronRight,
  Star,
  MessageSquare,
  Home,
  BookOpen,
  Book,
} from "lucide-react";

// Course components
import CourseRatingView from "../../components/RatingFeedback/Course/RatingView";
import CourseFeedbackView from "../../components/RatingFeedback/Course/FeedbackView";
import { useRatingFeedback as useCourseRatingFeedback } from "../../hooks/useCourseRatingFeedback";

// Ebook components
import EbookRatingView from "../../components/RatingFeedback/Ebook/RatingView";
import EbookFeedbackView from "../../components/RatingFeedback/Ebook/FeedbackView";
import { useRatingFeedback as useEbookRatingFeedback } from "../../hooks/useEbookRatingFeedback";

export default function RatingFeedback() {
  const [mainTab, setMainTab] = useState("course"); // 'course' or 'ebook'
  const [activeTab, setActiveTab] = useState("rating"); // 'rating' or 'feedback'

  // Course data
  const {
    ratings: courseRatings,
    feedbacks: courseFeedbacks,
    loading: courseLoading,
    error: courseError,
    fetchRatings: fetchCourseRatings,
    fetchFeedbacks: fetchCourseFeedbacks,
  } = useCourseRatingFeedback();

  // Ebook data
  const {
    ratings: ebookRatings,
    feedbacks: ebookFeedbacks,
    loading: ebookLoading,
    error: ebookError,
    fetchRatings: fetchEbookRatings,
    fetchFeedbacks: fetchEbookFeedbacks,
  } = useEbookRatingFeedback();

  // Fetch data when tabs change
  useEffect(() => {
    if (mainTab === "course") {
      if (
        activeTab === "rating" &&
        (!courseRatings || courseRatings.length === 0)
      ) {
        fetchCourseRatings();
      } else if (
        activeTab === "feedback" &&
        (!courseFeedbacks || courseFeedbacks.length === 0)
      ) {
        fetchCourseFeedbacks();
      }
    } else if (mainTab === "ebook") {
      if (
        activeTab === "rating" &&
        (!ebookRatings || ebookRatings.length === 0)
      ) {
        fetchEbookRatings();
      } else if (
        activeTab === "feedback" &&
        (!ebookFeedbacks || ebookFeedbacks.length === 0)
      ) {
        fetchEbookFeedbacks();
      }
    }
  }, [mainTab, activeTab]);

  const MainPage = () => (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Modern Header with Gradient Background */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#5577B5] via-[#6B8BC5] to-[#7B9DD8] shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Rating & Feedback Management
            </h1>
            <p className="text-blue-100">
              View and manage {mainTab === "course" ? "course" : "ebook"}{" "}
              ratings and feedback
            </p>
          </div>

          {/* Modern Breadcrumb */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
            <Home className="w-4 h-4 text-blue-100" />
            <span className="text-blue-100 text-sm">Home</span>
            <ChevronRight className="w-4 h-4 text-blue-100" />
            <span className="text-white text-sm font-medium">
              Rating & Feedback
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Main Tabs + Sub Tabs - Combined in one section */}
        <div className="border-b border-gray-200">
          {/* Main Tabs Row - Course / eBook */}
          <div className="flex gap-3 p-4 bg-gray-50 border-b border-gray-200">
            <button
              onClick={() => {
                setMainTab("course");
                setActiveTab("rating");
              }}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 ${
                mainTab === "course"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Course</span>
            </button>

            <button
              onClick={() => {
                setMainTab("ebook");
                setActiveTab("rating");
              }}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 ${
                mainTab === "ebook"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Book className="w-5 h-5" />
              <span>eBook</span>
            </button>
          </div>

          {/* Sub Tabs Row - Rating / Feedback (Smaller) */}
          <div className="flex bg-white px-4">
            <button
              onClick={() => setActiveTab("rating")}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-medium transition-all duration-200 relative ${
                activeTab === "rating"
                  ? mainTab === "course"
                    ? "text-blue-600"
                    : "text-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Rating</span>
              {activeTab === "rating" && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    mainTab === "course" ? "bg-blue-600" : "bg-green-600"
                  }`}
                ></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("feedback")}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-medium transition-all duration-200 relative ${
                activeTab === "feedback"
                  ? mainTab === "course"
                    ? "text-blue-600"
                    : "text-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Feedback</span>
              {activeTab === "feedback" && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    mainTab === "course" ? "bg-blue-600" : "bg-green-600"
                  }`}
                ></div>
              )}
            </button>
          </div>
        </div>

        {/* Content Section with Padding */}
        <div className="p-6">
          {/* Course Content */}
          {mainTab === "course" && (
            <>
              {activeTab === "rating" && (
                <CourseRatingView
                  ratings={courseRatings}
                  loading={courseLoading}
                  error={courseError}
                  onRefresh={fetchCourseRatings}
                />
              )}

              {activeTab === "feedback" && (
                <CourseFeedbackView
                  feedbacks={courseFeedbacks}
                  loading={courseLoading}
                  error={courseError}
                  onRefresh={fetchCourseFeedbacks}
                />
              )}
            </>
          )}

          {/* Ebook Content */}
          {mainTab === "ebook" && (
            <>
              {activeTab === "rating" && (
                <EbookRatingView
                  ratings={ebookRatings}
                  loading={ebookLoading}
                  error={ebookError}
                  onRefresh={fetchEbookRatings}
                />
              )}

              {activeTab === "feedback" && (
                <EbookFeedbackView
                  feedbacks={ebookFeedbacks}
                  loading={ebookLoading}
                  error={ebookError}
                  onRefresh={fetchEbookFeedbacks}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <MainPage />
    </div>
  );
}

RatingFeedback.layout = Admin;
