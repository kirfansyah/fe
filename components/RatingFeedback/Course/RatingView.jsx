import { useState } from "react";
import { LayoutGrid, List, Star } from "lucide-react";
import RatingCard from "./RatingCard";
import RatingList from "./RatingList";

export default function RatingView({ ratings, loading, error, onRefresh }) {
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'list'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error loading data</p>
          <p className="text-sm mt-2">{error}</p>
          <button
            onClick={onRefresh}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex justify-end items-center">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              viewMode === "card"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-sm font-medium">Card View</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              viewMode === "list"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
            <span className="text-sm font-medium">List View</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {ratings && ratings.length > 0 ? (
        viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {ratings.map((rating) => (
              <RatingCard key={rating.id_course} rating={rating} />
            ))}
          </div>
        ) : (
          <RatingList ratings={ratings} />
        )
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No rating data available</p>
        </div>
      )}
    </div>
  );
}
