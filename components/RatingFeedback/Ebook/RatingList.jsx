import { Star } from "lucide-react";

export default function RatingList({ ratings }) {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };

  const renderStarBar = (count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 w-8">{count}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-semibold text-sm text-gray-700">
        <div className="col-span-3">Course Title</div>
        <div className="col-span-2 text-center">Average Rating</div>
        <div className="col-span-1 text-center">Reviews</div>
        <div className="col-span-6">Star Distribution</div>
      </div>

      {/* Table Body */}
      <div className="divide-y">
        {ratings.map((rating) => {
          const totalStars =
            rating.star_5 +
            rating.star_4 +
            rating.star_3 +
            rating.star_2 +
            rating.star_1;

          return (
            <div
              key={rating.id_ebook}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors duration-200"
            >
              {/* Course Title */}
              <div className="col-span-3">
                <p className="font-semibold text-gray-800 line-clamp-2">
                  {rating.ebook_title}
                </p>
              </div>

              {/* Average Rating */}
              <div className="col-span-2 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800 mb-1">
                  {rating.rating_average.toFixed(1)}
                </span>
                {renderStars(rating.rating_average)}
              </div>

              {/* Total Reviews */}
              <div className="col-span-1 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-700">
                  {rating.total_reviewer}
                </span>
              </div>

              {/* Star Distribution */}
              <div className="col-span-6 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-12">5 stars</span>
                  {renderStarBar(rating.star_5, totalStars)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-12">4 stars</span>
                  {renderStarBar(rating.star_4, totalStars)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-12">3 stars</span>
                  {renderStarBar(rating.star_3, totalStars)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-12">2 stars</span>
                  {renderStarBar(rating.star_2, totalStars)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-12">1 star</span>
                  {renderStarBar(rating.star_1, totalStars)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
