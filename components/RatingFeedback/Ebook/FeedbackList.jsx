import { Star, Building2 } from "lucide-react";

export default function FeedbackList({ feedbacks, isEbook = false }) {
  // Parse rating from "X/5" format to number
  const parseRating = (ratingString) => {
    if (!ratingString) return 0;
    const match = ratingString.match(/^(\d+)\/5$/);
    return match ? parseInt(match[1]) : 0;
  };

  const renderStars = (ratingString) => {
    const rating = parseRating(ratingString);
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const titleKey = isEbook ? "ebook_title" : "course_title";
  const itemLabel = isEbook ? "eBook" : "Course";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-semibold text-sm text-gray-700">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-4">{itemLabel}</div>
        <div className="col-span-5">Feedback</div>
        <div className="col-span-2 text-center">Rating</div>
      </div>

      {/* Table Body */}
      <div className="divide-y">
        {feedbacks.map((feedback, index) => {
          const rating = parseRating(feedback.rating);

          return (
            <div
              key={`${feedback.id_ebook || feedback.id_course}-${index}`}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors duration-200"
            >
              {/* Number */}
              <div className="col-span-1 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600">
                  {index + 1}
                </span>
              </div>

              {/* Item Info */}
              <div className="col-span-4">
                <p className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">
                  {feedback[titleKey]}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feedback.company_id && (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      <Building2 className="w-3 h-3" />
                      Company {feedback.company_id}
                    </span>
                  )}
                  {feedback.company_id === null && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      All Companies
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback Content */}
              <div className="col-span-5">
                <p className="text-gray-800 text-sm leading-relaxed line-clamp-3">
                  {feedback.feedback || "No feedback provided"}
                </p>
              </div>

              {/* Rating */}
              <div className="col-span-2 flex flex-col items-center justify-center">
                {renderStars(feedback.rating)}
                <span className="text-sm font-semibold text-gray-700 mt-1">
                  {feedback.rating || "0/5"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
