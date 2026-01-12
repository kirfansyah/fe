import { useState, useEffect } from "react";
import { MessageSquare, Filter, Search, X, Building2 } from "lucide-react";
import FeedbackList from "./FeedbackList";

export default function FeedbackView({ feedbacks, loading, error, onRefresh }) {
  const [filteredFeedbacks, setFilteredFeedbacks] = useState(feedbacks);
  const [filters, setFilters] = useState({
    companyUnit: "",
    course: "",
    searchText: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique company units and courses for filter options
  const uniqueCompanyUnits = [
    ...new Set(feedbacks?.map((f) => f.company_name).filter(Boolean) || []),
  ];

  const uniqueCourses = [
    ...new Set(feedbacks?.map((f) => f.course_title) || []),
  ];

  useEffect(() => {
    setFilteredFeedbacks(feedbacks);
  }, [feedbacks]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    let filtered = feedbacks || [];

    if (filters.companyUnit) {
      filtered = filtered.filter((f) => f.company_name === filters.companyUnit);
    }

    if (filters.course) {
      filtered = filtered.filter((f) => f.course_title === filters.course);
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.feedback?.toLowerCase().includes(searchLower) ||
          f.course_title?.toLowerCase().includes(searchLower) ||
          f.company_name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredFeedbacks(filtered);
  };

  const resetFilters = () => {
    setFilters({
      companyUnit: "",
      course: "",
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
              <span className="font-semibold text-gray-700">
                Filters & Search
              </span>
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
              <Search className="absolute left-3 top-1/4 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search feedback, course, or company..."
                value={filters.searchText}
                onChange={(e) =>
                  handleFilterChange("searchText", e.target.value)
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Unit Filter - FIRST */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>Company Unit</span>
                  </div>
                </label>
                <select
                  value={filters.companyUnit}
                  onChange={(e) =>
                    handleFilterChange("companyUnit", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Companies</option>
                  {uniqueCompanyUnits.map((unit, index) => (
                    <option key={index} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Filter - SECOND */}
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
          <p className="text-gray-500 text-lg mb-4">
            No feedback data available
          </p>
          {!loading && (
            <button
              onClick={onRefresh}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load Feedback Data
            </button>
          )}
        </div>
      )}
    </div>
  );
}
