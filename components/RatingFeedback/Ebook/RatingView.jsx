import { useState, useEffect } from "react";
import { Star, LayoutGrid, List, Filter, Search, X, Building2, AlertCircle } from "lucide-react";
import RatingCard from "./RatingCard";
import RatingList from "./RatingList";

export default function RatingView({ ratings, loading, error, onRefresh }) {
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'list'
  const [filteredRatings, setFilteredRatings] = useState(ratings);
  const [filters, setFilters] = useState({
    companyUnit: "",
    ebook: "",
    searchText: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique company units and ebooks for filter options
  const uniqueCompanyUnits = [...new Set(ratings?.map((r) => r.company_name).filter(Boolean) || [])];

  const uniqueEbooks = [...new Set(ratings?.map((r) => r.ebook_title) || [])];

  useEffect(() => {
    setFilteredRatings(ratings);
  }, [ratings]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    let filtered = ratings || [];

    if (filters.companyUnit) {
      filtered = filtered.filter((r) => r.company_name === filters.companyUnit);
    }

    if (filters.ebook) {
      filtered = filtered.filter((r) => r.ebook_title === filters.ebook);
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter((r) => r.ebook_title?.toLowerCase().includes(searchLower) || r.company_name?.toLowerCase().includes(searchLower));
    }

    setFilteredRatings(filtered);
  };

  const resetFilters = () => {
    setFilters({
      companyUnit: "",
      ebook: "",
      searchText: "",
    });
    setFilteredRatings(ratings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-600" />
        </div>
        <div className="text-center text-600">
          <p className="text-lg font-semibold">{error}</p>
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
              <span className="font-semibold text-gray-700">Filters & Search</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors">
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

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button onClick={() => setViewMode("card")} className={`p-2 rounded-md transition-colors ${viewMode === "card" ? "bg-white text-green-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`} title="Card View">
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white text-green-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`} title="List View">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/4 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search ebook or company..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange("searchText", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  onChange={(e) => handleFilterChange("companyUnit", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Companies</option>
                  {uniqueCompanyUnits.map((unit, index) => (
                    <option key={index} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* eBook Filter - SECOND */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">eBook</label>
                <select value={filters.ebook} onChange={(e) => handleFilterChange("ebook", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">All eBooks</option>
                  {uniqueEbooks.map((ebook, index) => (
                    <option key={index} value={ebook}>
                      {ebook}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={resetFilters} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Reset
              </button>
              <button onClick={applyFilters} className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rating Display */}
      {filteredRatings && filteredRatings.length > 0 ? (
        viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRatings.map((rating) => (
              <RatingCard key={rating.id_ebook} rating={rating} />
            ))}
          </div>
        ) : (
          <RatingList ratings={filteredRatings} />
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
