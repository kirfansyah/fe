import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Filter,
} from "lucide-react";
import useEbookEmployee from "../../hooks/useEbookEmployee";
import EbookReader from "./EbookReader";
import EbookDescription from "./EbookDescription";

export default function EbookEmployee() {
  const {
    ebooks,
    loading,
    error,
    fetchEbooks,
    startReading,
    updateProgress,
    completeReading,
    submitReview,
    fetchEbookDetail,
  } = useEbookEmployee();

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
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");

  // description state
  const [showDescription, setShowDescription] = useState(false);
  const [selectedEbookForDesc, setSelectedEbookForDesc] = useState(null);

  // Fetch ebooks on mount
  useEffect(() => {
    fetchEbooks();
  }, [fetchEbooks]);

  // Get unique values for filters
  const category_names = [...new Set(ebooks.map((e) => e.category_name))];
  const titles = [...new Set(ebooks.map((e) => e.title))];
  const authors = [...new Set(ebooks.map((e) => e.author))];

  // Filter ebooks
  const filteredEbooks = ebooks.filter((ebook) => {
    const matchSearch = (ebook.title?.toLowerCase() || "").includes(
      searchQuery.toLowerCase()
    );

    const matchCategory =
      !selectedCategory || ebook.category_name === selectedCategory;
    const matchTitle = !selectedTitle || ebook.title === selectedTitle;
    const matchAuthor = !selectedAuthor || ebook.author === selectedAuthor;

    return matchSearch && matchCategory && matchTitle && matchAuthor;
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

        // Show notification if resuming
        if (response.is_resume) {
          console.log(`📖 Resuming from page ${response.last_page}`);
        } else {
          console.log(
            `📖 Started new reading session with log ID: ${response.id_log}`
          );
        }
      } else {
        // If API failed but we still want to open reader
        console.warn("⚠️ No log ID received, but opening reader anyway");
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
      alert(
        `Warning: Failed to log reading session. You can still read the book.\n\nError: ${err.message}`
      );
      setSelectedEbook({
        ...ebook,
        resumePage: 1,
        isResume: false,
      });
      setShowReader(true);
    }
  };

  // handleCloseReader dengan refresh
  const handleCloseReader = async (
    lastPage,
    totalPages,
    shouldRefresh = false
  ) => {
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
  const handleOpenDescription = async (ebook) => {
    try {
      // Fetch full detail with progress
      const response = await fetchEbookDetail(ebook.id_ebook);
      if (response.success) {
        setSelectedEbookForDesc(response.data);
        setShowDescription(true);
      }
    } catch (err) {
      console.error("Failed to fetch ebook detail:", err);
      // Fallback to basic info
      setSelectedEbookForDesc(ebook);
      setShowDescription(true);
    }
  };

  // Handle close description
  const handleCloseDescription = () => {
    setShowDescription(false);
    setSelectedEbookForDesc(null);
  };

  // Handle read from description
  const handleReadFromDescription = () => {
    if (selectedEbookForDesc) {
      setShowDescription(false);
      handleOpenEbook(selectedEbookForDesc);
    }
  };

  // If reader is open, show reader component
  if (showReader && selectedEbook) {
    return (
      <EbookReader
        ebook={selectedEbook}
        logId={currentLogId}
        onClose={handleCloseReader}
        updateProgressFn={updateProgress}
        completeReadingFn={completeReading}
        submitReviewFn={submitReview}
      />
    );
  }

  // If description is open
  if (showDescription && selectedEbookForDesc) {
    return (
      <EbookDescription
        ebook={selectedEbookForDesc}
        onClose={handleCloseDescription}
        onReadEbook={handleReadFromDescription}
      />
    );
  }

  return (
    <div className="w-full mx-auto bg-gray-50 min-h-screen">
      {/* Loading Indicator */}
      {loading && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Loading ebooks...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search
              className="absolute left-3 top-1/3 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
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

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                handleFilterChange();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Category</option>
              {category_names.map((category, index) => (
                <option key={`cat-${index}`} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Title Filter */}
            <select
              value={selectedTitle}
              onChange={(e) => {
                setSelectedTitle(e.target.value);
                handleFilterChange();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Title</option>
              {titles.map((title, index) => (
                <option key={`ttl-${index}`} value={title}>
                  {title}
                </option>
              ))}
            </select>

            {/* Author Filter */}
            <select
              value={selectedAuthor}
              onChange={(e) => {
                setSelectedAuthor(e.target.value);
                handleFilterChange();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Author</option>
              {authors.map((author, index) => (
                <option key={`auth-${index}`} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Page Info */}
            <div className="text-sm text-gray-600 font-medium px-3">
              {startIndex + 1}-{Math.min(endIndex, filteredEbooks.length)} /{" "}
              {filteredEbooks.length}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List size={18} />
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
              >
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
        {/* Active Filters */}
        {(selectedCategory || selectedTitle || selectedAuthor) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">
              Active filters:
            </span>
            {selectedCategory && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2 font-medium">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("")}
                  className="hover:text-blue-900 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {selectedTitle && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2 font-medium">
                Title: {selectedTitle}
                <button
                  onClick={() => setSelectedTitle("")}
                  className="hover:text-green-900 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {selectedAuthor && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2 font-medium">
                Author: {selectedAuthor}
                <button
                  onClick={() => setSelectedAuthor("")}
                  className="hover:text-purple-900 font-bold"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      {viewMode === "grid" ? (
        /* Grid View - 5 columns */
        <div className="grid grid-cols-7 gap-8">
          {paginatedEbooks.length > 0 ? (
            paginatedEbooks.map((ebook) => (
              <div
                key={ebook.id_ebook}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Ebook Cover */}
                <div className="relative aspect-[2/3] bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden group">
                  {ebook.cover_image_url ? (
                    <img
                      src={ebook.cover_image_url}
                      alt={ebook.title}
                      className="w-full h-full object-cover"
                    />
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
                      {ebook.status === "In Progress" && (
                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                          Reading
                        </span>
                      )}
                      {ebook.status === "Done" && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Done
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Ebook Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px]">
                    {ebook.title}
                  </h3>

                  {/* Action Buttons */}
                  <div className="flex flex-auto gap-2">
                    <button
                      onClick={() => handleOpenEbook(ebook)}
                      className="w-1/2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      Open eBook
                    </button>
                    <button
                      onClick={() => handleOpenDescription(ebook)}
                      className="w-1/2 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
                    >
                      Description
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-5 py-16 text-center text-gray-500">
              <div className="text-6xl mb-4">📚</div>
              <div className="text-lg font-medium">No ebooks found</div>
              <div className="text-sm mt-2">
                Try adjusting your search or filters
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedEbooks.length === paginatedEbooks.length &&
                      paginatedEbooks.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">
                  Cover
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">
                  Title
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">
                  Author
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">
                  Category
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedEbooks.length > 0 ? (
                paginatedEbooks.map((ebook) => (
                  <tr
                    key={ebook.id_ebook}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedEbooks.includes(ebook.id_ebook)}
                        onChange={(e) =>
                          handleSelectEmployee(ebook.id_ebook, e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded overflow-hidden">
                        {ebook.cover_image_url ? (
                          <img
                            src={ebook.cover_image_url}
                            alt={ebook.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            📚
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {ebook.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {ebook.author || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                        {ebook.category_name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleOpenEbook(ebook)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                          Open
                        </button>
                        <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors">
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-16 text-center">
                    <div className="text-gray-500">
                      <div className="text-5xl mb-4">📚</div>
                      <div className="text-lg font-medium">No ebooks found</div>
                      <div className="text-sm mt-2">
                        Try adjusting your search or filters
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer - Page Size Selector */}
      {paginatedEbooks.length > 0 && (
        <div className="mt-6 flex justify-start">
          <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">
              Rows per page:
            </span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              className="rounded border border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none py-1.5 px-3 font-medium"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
