import { useState, useEffect } from "react";
import { MessageSquare, Filter, Search, X } from "lucide-react";
import FeedbackList from "./FeedbackList";

export default function FeedbackView({ feedbacks, loading, error, onRefresh }) {
  const [filteredFeedbacks, setFilteredFeedbacks] = useState(feedbacks);
  const [filters, setFilters] = useState({
    course: "",
    company_name: "",
    searchText: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique courses and company IDs for filter options
  const uniqueCourses = [
    ...new Set(feedbacks?.map((f) => f.course_title) || []),
  ];

  // Get unique company IDs (filter out null)
  const uniqueCompanyIds = [
    ...new Set(
      feedbacks
        ?.map((f) => f.company_name)
        .filter((id) => id !== null && id !== undefined) || []
    ),
  ].sort((a, b) => a - b);

  useEffect(() => {
    setFilteredFeedbacks(feedbacks);
  }, [feedbacks]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    let filtered = feedbacks || [];

    if (filters.course) {
      filtered = filtered.filter((f) => f.course_title === filters.course);
    }

    if (filters.company_name) {
      filtered = filtered.filter(
        (f) => f.company_name === filters.company_name
      );
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.feedback?.toLowerCase().includes(searchLower) ||
          f.course_title?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredFeedbacks(filtered);
  };

  const resetFilters = () => {
    setFilters({
      course: "",
      company_name: "",
      searchText: "",
    });
    setFilteredFeedbacks(feedbacks);
  };

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
      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Filters</span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {showFilters ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Hide Filters</span>
                </>
              ) : (
                <>
                  <Filter className="w-4 h-4" />
                  <span>Show Filters</span>
                </>
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={filters.searchText}
                onChange={(e) =>
                  handleFilterChange("searchText", e.target.value)
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <select
                  value={filters.course}
                  onChange={(e) => handleFilterChange("course", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map((course, index) => (
                    <option key={index} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <select
                  value={filters.company_name}
                  onChange={(e) =>
                    handleFilterChange("company_name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Companies</option>
                  {uniqueCompanyIds.map((company_name) => (
                    <option key={company_name} value={company_name}>
                      {company_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={resetFilters}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback List */}
      {filteredFeedbacks && filteredFeedbacks.length > 0 ? (
        <FeedbackList feedbacks={filteredFeedbacks} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No feedback data available</p>
        </div>
      )}
    </div>
  );
}
