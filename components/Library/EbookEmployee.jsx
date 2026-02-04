import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Grid, List, Filter, X, Library } from "lucide-react";
import useEbookEmployee from "../../hooks/useEbookEmployee";
import EbookReader from "./EbookReader";
import EbookDescription from "./EbookDescription";

export default function EbookEmployee() {
  const { ebooks, ebookDescription, loading, error, fetchEbooks, fetchEbookDescription, startReading, updateProgress, completeReading, submitReview } = useEbookEmployee();

  const [selectedEbooks, setSelectedEbooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");

  // eBook Reader state
  const [selectedEbook, setSelectedEbook] = useState(null);
  const [showReader, setShowReader] = useState(false);
  const [currentLogId, setCurrentLogId] = useState(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedCompanyUnit, setSelectedCompanyUnit] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // description state
  const [showDescription, setShowDescription] = useState(false);
  const [selectedEbookForDesc, setSelectedEbookForDesc] = useState(null);
  const [originalEbook, setOriginalEbook] = useState(null); // Store original ebook with PDF URL

  // Fetch ebooks on mount
  useEffect(() => {
    fetchEbooks();
  }, [fetchEbooks]);

  // Get unique values for filters
  const category_names = [...new Set(ebooks.map((e) => e.category_name).filter(Boolean))];
  const sub_categories = [...new Set(ebooks.map((e) => e.subcategory_name || e.sub_category).filter(Boolean))];
  const company_units = [...new Set(ebooks.map((e) => e.company_name).filter(Boolean))];
  const authors = [...new Set(ebooks.map((e) => e.author).filter(Boolean))];

  // Filter ebooks
  const filteredEbooks = ebooks.filter((ebook) => {
    const matchSearch = (ebook.title?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchCategory = !selectedCategory || ebook.category_name === selectedCategory;
    const matchSubCategory = !selectedSubCategory || (ebook.subcategory_name || ebook.sub_category) === selectedSubCategory;
    const matchCompanyUnit = !selectedCompanyUnit || ebook.company_name === selectedCompanyUnit;
    const matchAuthor = !selectedAuthor || ebook.author === selectedAuthor;

    return matchSearch && matchCategory && matchSubCategory && matchCompanyUnit && matchAuthor;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEbooks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEbooks = filteredEbooks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedCompanyUnit("");
    setSelectedAuthor("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEbooks(paginatedEbooks.map((emp) => emp.id_ebook));
    } else {
      setSelectedEbooks([]);
    }
  };

  const handleSelectEmployee = (id, checked) => {
    if (checked) {
      setSelectedEbooks([...selectedEbooks, id]);
    } else {
      setSelectedEbooks(selectedEbooks.filter((empId) => empId !== id));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setCurrentPage(1);
  };

  // Di dalam handleOpenEbook

  const handleOpenEbook = async (ebook) => {
    try {
      // Start reading log (will check for existing progress)
      const response = await startReading(ebook.id_ebook, {
        userId: "current_user_id", // TODO: Get from auth context/cookies
        device: "Web Browser",
      });

      if (response.success && response.id_log) {
        setCurrentLogId(response.id_log);
        setSelectedEbook({
          ...ebook,
          resumePage: response.last_page || 1,
          isResume: response.is_resume || false,
        });
        setShowReader(true);
      } else {
        // If API failed but we still want to open reader
        setSelectedEbook({
          ...ebook,
          resumePage: 1,
          isResume: false,
        });
        setShowReader(true);
      }
    } catch (err) {
      console.error("❌ Failed to open ebook:", err);
      // Still open reader even if logging fails
      alert(`Warning: Failed to log reading session. You can still read the book.\n\nError: ${err.message}`);
      setSelectedEbook({
        ...ebook,
        resumePage: 1,
        isResume: false,
      });
      setShowReader(true);
    }
  };

  // handleCloseReader dengan refresh
  const handleCloseReader = async (lastPage, totalPages, shouldRefresh = false) => {
    if (currentLogId && lastPage) {
      try {
        const isCompleted = lastPage >= totalPages;

        if (isCompleted) {
          await completeReading(currentLogId, lastPage, {
            userId: "current_user_id",
            device: "Web Browser",
          });
        } else {
          await updateProgress(currentLogId, lastPage, totalPages, {
            userId: "current_user_id",
            device: "Web Browser",
          });
        }
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
    }

    setShowReader(false);
    setSelectedEbook(null);
    setCurrentLogId(null);

    // Refresh ebook list if needed
    if (shouldRefresh) {
      fetchEbooks();
    }
  };

  // Handle open description
  const handleOpenDescription = async (ebooks) => {
    setOriginalEbook(ebooks); // Save original ebook data (includes PDF URL)
    try {
      // Fetch full detail with progress
      const response = await fetchEbookDescription(ebooks.id_ebook);
      if (response.success) {
        // Merge original data with detail to preserve all fields including PDF URL
        setSelectedEbookForDesc({
          ...ebookDescription, // Original data (with PDF URL and cover)
          ...response.data, // Detail data (description, stats, etc.)
        });
        setShowDescription(true);
      }
    } catch (err) {
      console.error("Failed to fetch ebook detail:", err);
      // Fallback to basic info
      setSelectedEbookForDesc(ebookDescription);
      setShowDescription(true);
    }
  };

  // Handle close description
  const handleCloseDescription = () => {
    setShowDescription(false);
    setSelectedEbookForDesc(null);
    setOriginalEbook(null); // Clear original reference
  };

  // Handle read from description
  const handleReadFromDescription = () => {
    if (selectedEbookForDesc) {
      setShowDescription(false);
      // Merge original ebook data (with PDF URL) and detail data
      const mergedEbook = originalEbook ? { ...originalEbook, ...selectedEbookForDesc } : selectedEbookForDesc;

      handleOpenEbook(mergedEbook);
    }
  };

  // Check if any filter is active
  const hasActiveFilters = selectedCategory || selectedSubCategory || selectedCompanyUnit || selectedAuthor;

  // If reader is open, show reader component
  if (showReader && selectedEbook) {
    return <EbookReader ebook={selectedEbook} logId={currentLogId} onClose={handleCloseReader} updateProgressFn={updateProgress} completeReadingFn={completeReading} submitReviewFn={submitReview} />;
  }

  // If description is open
  if (showDescription && selectedEbookForDesc) {
    return <EbookDescription ebookDescription={selectedEbookForDesc} onClose={handleCloseDescription} onReadEbook={handleReadFromDescription} />;
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Loading Indicator */}
      {loading && <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">Loading ebooks...</div>}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        {/* Top Row - Search, Filter Toggle, View Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left Side - Search */}
          <div className="relative flex-1 w-full lg:w-auto lg:min-w-[250px] lg:max-w-md">
            <Search className="absolute left-3 top-1/4 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleFilterChange();
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                showFilters ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
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
                  {hasActiveFilters && <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">{[selectedCategory, selectedSubCategory, selectedCompanyUnit, selectedAuthor].filter(Boolean).length}</span>}
                </>
              )}
            </button>

            {/* Page Info */}
            <div className="text-sm text-gray-600 font-medium px-3">
              {filteredEbooks.length > 0 ? (
                <>
                  {startIndex + 1}-{Math.min(endIndex, filteredEbooks.length)} / {filteredEbooks.length}
                </>
              ) : (
                "0 results"
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                <Grid size={18} />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                <List size={18} />
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg">
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns - Collapsible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 px-2">
            <div className="grid lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 mb-4">
              {/* Company Unit Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company Unit</label>
                <select
                  value={selectedCompanyUnit}
                  onChange={(e) => {
                    setSelectedCompanyUnit(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm appearance-none cursor-pointer"
                >
                  <option value="">All Company Units</option>
                  {company_units.map((unit, index) => (
                    <option key={`unit-${index}`} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {category_names.map((category, index) => (
                    <option key={`cat-${index}`} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Category Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sub Category</label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => {
                    setSelectedSubCategory(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm appearance-none cursor-pointer"
                >
                  <option value="">All Sub Categories</option>
                  {sub_categories.map((subCat, index) => (
                    <option key={`subcat-${index}`} value={subCat}>
                      {subCat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Author</label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => {
                    setSelectedAuthor(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm appearance-none cursor-pointer"
                >
                  <option value="">All Authors</option>
                  {authors.map((author, index) => (
                    <option key={`auth-${index}`} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="mt-4">
                <button onClick={handleClearFilters} className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-lg transition-colors border border-red-200">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            {selectedCompanyUnit && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-2 font-medium">
                Unit: {selectedCompanyUnit}
                <button onClick={() => setSelectedCompanyUnit("")} className="hover:text-indigo-900 font-bold">
                  ×
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2 font-medium">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("")} className="hover:text-blue-900 font-bold">
                  ×
                </button>
              </span>
            )}
            {selectedSubCategory && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2 font-medium">
                Sub: {selectedSubCategory}
                <button onClick={() => setSelectedSubCategory("")} className="hover:text-green-900 font-bold">
                  ×
                </button>
              </span>
            )}
            {selectedAuthor && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2 font-medium">
                Author: {selectedAuthor}
                <button onClick={() => setSelectedAuthor("")} className="hover:text-purple-900 font-bold">
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      {viewMode === "grid" ? (
        /* Grid View - Responsive */
        <div
          className="w-full grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          }}
        >
          {paginatedEbooks.length > 0 ? (
            paginatedEbooks.map((ebook) => (
              <div key={ebook.id_ebook} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Ebook Cover */}
                <div className="relative aspect-[2/3] bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden group">
                  {ebook.cover_image_url ? (
                    <img src={ebook.cover_image_url} alt={ebook.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-1">📚</div>
                        <div className="text-xs">No Cover</div>
                      </div>
                    </div>
                  )}

                  {/* Status Badge - Simple Inline Condition */}
                  {ebook.status && ebook.status !== "Not Started" && (
                    <div className="absolute top-2 left-2">
                      {ebook.status === "In Progress" && <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">Reading</span>}
                      {ebook.status === "Done" && <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Done</span>}
                    </div>
                  )}
                </div>

                {/* Ebook Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px]">{ebook.title}</h3>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={() => handleOpenEbook(ebook)} className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">
                      Open eBook
                    </button>
                    <button onClick={() => handleOpenDescription(ebook)} className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors">
                      Description
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-gray-500">
              <div className="w-16 h-16 bg-red-100 text-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Library className="w-8 h-8 text-600" />
              </div>
              <div className="text-lg font-medium">No ebooks found</div>
              <div className="text-sm mt-2">Try adjusting your search or filters</div>
            </div>
          )}
        </div>
      ) : (
        /* List View - Responsive Table */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-14 px-4 py-3 text-center font-semibold text-gray-700 text-sm">No</th>
                  <th className="w-16 px-4 py-3 text-left font-semibold text-gray-700 text-sm">Cover</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm min-w-[200px]">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">Author</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">Company Unit</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">Sub Category</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 text-sm min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedEbooks.length > 0 ? (
                  paginatedEbooks.map((ebook, index) => (
                    <tr key={ebook.id_ebook} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">{startIndex + index + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded overflow-hidden flex-shrink-0">
                          {ebook.cover_image_url ? (
                            <img src={ebook.cover_image_url} alt={ebook.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">📚</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 line-clamp-2">{ebook.title}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{ebook.author || "-"}</td>
                      <td className="px-4 py-3">
                        {ebook.company_name ? <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded">{ebook.company_name}</span> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">{ebook.category_name || "-"}</span>
                      </td>
                      <td className="px-4 py-3">
                        {ebook.subcategory_name || ebook.sub_category ? (
                          <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">{ebook.subcategory_name || ebook.sub_category}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleOpenEbook(ebook)} className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors">
                            Open eBook
                          </button>
                          <button onClick={() => handleOpenDescription(ebook)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors">
                            Description
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-16 text-center">
                      <div className="text-gray-500">
                        <div className="text-5xl mb-4">📚</div>
                        <div className="text-lg font-medium">No ebooks found</div>
                        <div className="text-sm mt-2">Try adjusting your search or filters</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer - Page Size Selector */}
      {paginatedEbooks.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3 w-fit">
            <span className="text-sm text-gray-600 font-medium w-fit">Rows per page:</span>
            <select value={pageSize} onChange={(e) => handlePageSizeChange(e.target.value)} className="rounded border border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none py-1.5 px-3 font-medium w-20">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Mobile Pagination Info */}
          <div className="sm:hidden text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}
