import { useState } from "react";
import Admin from "layouts/Admin.js";
import RatingView from "../../components/RatingFeedback/RatingView";
import FeedbackView from "../../components/RatingFeedback/FeedbackView";
import { useRatingFeedback } from "../../hooks/useRatingFeedback";
import { ChevronRight, Star, MessageSquare, Home } from "lucide-react";

export default function RatingFeedback() {
  const [activeTab, setActiveTab] = useState("rating");
  const { ratings, feedbacks, loading, error, fetchRatings, fetchFeedbacks } =
    useRatingFeedback();

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
              View and manage course ratings and feedback
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

      {/* Modern Tabs Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("rating")}
            className={`flex items-center gap-3 px-8 py-4 font-medium text-sm transition-all duration-200 relative ${
              activeTab === "rating"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Star className="w-5 h-5" />
            <span>Rating</span>
            {activeTab === "rating" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex items-center gap-3 px-8 py-4 font-medium text-sm transition-all duration-200 relative ${
              activeTab === "feedback"
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Feedback</span>
            {activeTab === "feedback" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
            )}
          </button>
        </div>

        {/* Content Section with Padding */}
        <div className="p-6">
          {activeTab === "rating" && (
            <RatingView
              ratings={ratings}
              loading={loading}
              error={error}
              onRefresh={fetchRatings}
            />
          )}

          {activeTab === "feedback" && (
            <FeedbackView
              feedbacks={feedbacks}
              loading={loading}
              error={error}
              onRefresh={fetchFeedbacks}
            />
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
