import { Star, Building } from "lucide-react";

export default function RatingCard({ rating }) {
  const {
    course_title,
    rating_average,
    total_reviewer,
    company_name,
    star_5,
    star_4,
    star_3,
    star_2,
    star_1,
  } = rating;

  // Calculate star percentages
  const totalStars = star_5 + star_4 + star_3 + star_2 + star_1 || 1;
  const starData = [
    { stars: 5, count: star_5, percentage: (star_5 / totalStars) * 100 },
    { stars: 4, count: star_4, percentage: (star_4 / totalStars) * 100 },
    { stars: 3, count: star_3, percentage: (star_3 / totalStars) * 100 },
    { stars: 2, count: star_2, percentage: (star_2 / totalStars) * 100 },
    { stars: 1, count: star_1, percentage: (star_1 / totalStars) * 100 },
  ];

  // Render stars based on rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-5 h-5 fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-5 h-5 text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
      {/* Course Title */}
      <h2 className="text-lg font-bold text-gray-800 line-clamp-2 min-h-[2rem]">
        {course_title}
      </h2>
      <div className="flex flex-wrap gap-2 mb-1">
        {company_name && (
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            <Building className="w-3 h-3" />
            {company_name}
          </span>
        )}
        {company_name === null && (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            All Companies
          </span>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-6">
        <p>Rating are verified and are from employee based on</p>
        <p>course access</p>
      </div>

      <div className="flex items-start gap-6">
        {/* Average Rating */}
        <div className="flex flex-col items-center">
          <div className="text-5xl font-bold text-gray-800 mb-2">
            {rating_average.toFixed(1)}
          </div>
          {renderStars(rating_average)}
          <div className="text-sm text-gray-600 mt-2">{total_reviewer}</div>
        </div>

        {/* Star Distribution */}
        <div className="flex-1 space-y-2">
          {starData.map((star) => (
            <div key={star.stars} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-3">
                {star.stars}
              </span>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${star.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
