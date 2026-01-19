// components/Loading/Skeleton.jsx
export const CourseCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Expand button skeleton */}
          <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
          
          {/* Thumbnail skeleton */}
          <div className="w-20 h-14 bg-gray-200 rounded-lg"></div>
          
          {/* Content skeleton */}
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        {/* Actions skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export const StatsCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};

export const ReportTableSkeleton = () => {
  return (
    <div className="bg-white rounded-lg">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap animate-pulse">
        <div className="flex-1 max-w-md">
          <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(11)].map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t border-gray-200">
                {[...Array(11)].map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-4 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-40 bg-gray-200 rounded"></div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReportStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg shadow-md p-4">
          <div className="h-4 bg-white bg-opacity-30 rounded w-24 mb-2"></div>
          <div className="h-10 bg-white bg-opacity-30 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
};

export const LoadingSpinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8"
  };

  return (
    <svg 
      className={`animate-spin ${sizeClasses[size]}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};