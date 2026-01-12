import { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useSweetAlert } from "@/hooks/useSweetAlert";

export default function Monitoring({ employees }) {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedCompanyUnit, setSelectedCompanyUnit] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEbook, setSelectedEbook] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { showWarning, showSuccess, showError } = useSweetAlert();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Get unique values for filters
  const company_names = [
    ...new Set(employees.map((e) => e.company_name).filter(Boolean)),
  ];
  const dept_abbrs = [
    ...new Set(employees.map((e) => e.dept_abbr).filter(Boolean)),
  ];
  const ebooks = [...new Set(employees.map((e) => e.title).filter(Boolean))];
  const categories = [
    ...new Set(employees.map((e) => e.category_name).filter(Boolean)),
  ];
  const subCategories = [
    ...new Set(employees.map((e) => e.subcategory_name).filter(Boolean)),
  ];
  const statuses = [...new Set(employees.map((e) => e.status).filter(Boolean))];

  // Count active filters
  const activeFilterCount = [
    selectedCompanyUnit,
    selectedDepartment,
    selectedEbook,
    selectedCategory,
    selectedSubCategory,
    selectedStatus,
    startDate,
    endDate,
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCompanyUnit("");
    setSelectedDepartment("");
    setSelectedEbook("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchSearch =
      (employee.nama?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (employee.employee_id || "").includes(searchQuery) ||
      (employee.position_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );

    const matchCompanyUnit =
      !selectedCompanyUnit || employee.company_name === selectedCompanyUnit;
    const matchDepartment =
      !selectedDepartment || employee.dept_abbr === selectedDepartment;
    const matchEbook = !selectedEbook || employee.title === selectedEbook;
    const matchCategory =
      !selectedCategory || employee.category_name === selectedCategory;
    const matchSubCategory =
      !selectedSubCategory || employee.subcategory_name === selectedSubCategory;
    const matchStatus = !selectedStatus || employee.status === selectedStatus;

    // Date range filter
    let matchDate = true;
    if (startDate || endDate) {
      const employeeDate = employee.start_time
        ? new Date(employee.start_time)
        : null;
      if (employeeDate) {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (employeeDate < start) matchDate = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (employeeDate > end) matchDate = false;
        }
      } else {
        matchDate = false;
      }
    }

    return (
      matchSearch &&
      matchCompanyUnit &&
      matchDepartment &&
      matchEbook &&
      matchCategory &&
      matchSubCategory &&
      matchStatus &&
      matchDate
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEmployees(paginatedEmployees.map((emp) => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (id, checked) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, id]);
    } else {
      setSelectedEmployees(selectedEmployees.filter((empId) => empId !== id));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setCurrentPage(1); // Reset to first page
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-800";
      case "Read":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportToExcel = () => {
    if (selectedEmployees.length === 0) {
      showWarning("Please select at least one employee to export");
      return;
    }

    try {
      // Get selected employees data
      const selectedData = employees.filter((emp) =>
        selectedEmployees.includes(emp.id)
      );

      // Prepare data for Excel
      const excelData = selectedData.map((emp, index) => ({
        No: index + 1,
        Name: emp.nama || "",
        "Employee ID": emp.employee_id || "",
        Position: emp.position_name || "",
        Department: emp.dept_abbr || "",
        "Company Unit": emp.company_name || "",
        "eBook Title": emp.title || "",
        Author: emp.author || "",
        Category: emp.category_name || "",
        "Sub Category": emp.subcategory_name || "",
        "Status Read": emp.status || "",
        "Total Time": emp.total_time?.split(".")[0] || "-",
        "Average (min)": emp.average_minutes || "-",
        Date: emp.start_time
          ? new Date(emp.start_time).toLocaleDateString("id-ID")
          : "",
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 5 }, // No
        { wch: 25 }, // Name
        { wch: 18 }, // Employee ID
        { wch: 20 }, // Position
        { wch: 15 }, // Department
        { wch: 25 }, // Company Unit
        { wch: 30 }, // eBook Title
        { wch: 20 }, // Author
        { wch: 15 }, // Category
        { wch: 15 }, // Sub Category
        { wch: 12 }, // Status Read
        { wch: 12 }, // Total Time
        { wch: 12 }, // Average
        { wch: 12 }, // Date
      ];
      worksheet["!cols"] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "eBook Reading Report");

      // Generate filename with date
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(
        today.getMonth() + 1
      ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
      const filename = `eBook_Reading_Report_${dateStr}.xlsx`;

      // Export file
      XLSX.writeFile(workbook, filename);

      showSuccess(
        `Successfully exported ${selectedData.length} records to Excel`
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showError("Failed to export to Excel. Please try again.");
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white">
      {/* Header with Search, Filter Toggle, and Export */}
      <div className="flex items-center justify-between mb-4 gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0 max-w-md">
          <Search
            className="absolute left-3 top-1/4 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search name, ID, or position..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleFilterChange();
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
              showFilters
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Export Excel Button */}
          <button
            onClick={exportToExcel}
            disabled={selectedEmployees.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-sm"
          >
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
            {selectedEmployees.length > 0 && (
              <span className="bg-white text-green-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                {selectedEmployees.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Filters Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700 text-sm">Filters</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Column 1: Company, Dept */}
            <div className="space-y-3">
              <select
                value={selectedCompanyUnit}
                onChange={(e) => {
                  setSelectedCompanyUnit(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Company</option>
                {company_names.map((unit, index) => (
                  <option key={`company-${unit || index}`} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>

              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Dept</option>
                {dept_abbrs.map((dept, index) => (
                  <option key={`dept-${dept || index}`} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Column 2: Category, Sub Category */}
            <div className="space-y-3">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Category</option>
                {categories.map((cat, index) => (
                  <option key={`cat-${cat || index}`} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedSubCategory}
                onChange={(e) => {
                  setSelectedSubCategory(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Sub Category</option>
                {subCategories.map((subCat, index) => (
                  <option key={`subcat-${subCat || index}`} value={subCat}>
                    {subCat}
                  </option>
                ))}
              </select>
            </div>

            {/* Column 3: eBooks, Status */}
            <div className="space-y-3">
              <select
                value={selectedEbook}
                onChange={(e) => {
                  setSelectedEbook(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All eBooks</option>
                {ebooks.map((ebook, index) => (
                  <option key={`ebook-${ebook || index}`} value={ebook}>
                    {ebook}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Status</option>
                {statuses.map((status, index) => (
                  <option key={`status-${status || index}`} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Column 4: Date Range */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600 whitespace-nowrap w-16">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    handleFilterChange();
                  }}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600 whitespace-nowrap w-16">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    handleFilterChange();
                  }}
                  min={startDate}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(selectedCompanyUnit ||
        selectedDepartment ||
        selectedEbook ||
        selectedCategory ||
        selectedSubCategory ||
        selectedStatus ||
        startDate ||
        endDate) && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          {selectedCompanyUnit && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
              {selectedCompanyUnit}
              <button
                onClick={() => setSelectedCompanyUnit("")}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedDepartment && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
              {selectedDepartment}
              <button
                onClick={() => setSelectedDepartment("")}
                className="hover:text-green-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedEbook && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2">
              {selectedEbook}
              <button
                onClick={() => setSelectedEbook("")}
                className="hover:text-purple-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-2">
              {selectedCategory}
              <button
                onClick={() => setSelectedCategory("")}
                className="hover:text-indigo-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedSubCategory && (
            <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm flex items-center gap-2">
              {selectedSubCategory}
              <button
                onClick={() => setSelectedSubCategory("")}
                className="hover:text-cyan-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedStatus && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-2">
              {selectedStatus}
              <button
                onClick={() => setSelectedStatus("")}
                className="hover:text-orange-900"
              >
                ×
              </button>
            </span>
          )}
          {(startDate || endDate) && (
            <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm flex items-center gap-2">
              {startDate && endDate
                ? `${new Date(startDate).toLocaleDateString(
                    "id-ID"
                  )} - ${new Date(endDate).toLocaleDateString("id-ID")}`
                : startDate
                ? `From ${new Date(startDate).toLocaleDateString("id-ID")}`
                : `Until ${new Date(endDate).toLocaleDateString("id-ID")}`}
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="hover:text-pink-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[1400px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-3 py-3">
                <input
                  type="checkbox"
                  checked={
                    selectedEmployees.length === paginatedEmployees.length &&
                    paginatedEmployees.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                Name
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                Employee ID
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                Position
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                Department
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                Company Unit
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                eBook Title
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                Author
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                Category
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                Sub Category
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                Status
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                Total Time
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                Average
              </th>
              <th className="text-left px-3 py-3 font-medium text-gray-700 text-sm">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee) => (
                <tr
                  key={`employee-${employee.id}`}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={(e) =>
                        handleSelectEmployee(employee.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-3 text-gray-900 font-medium text-sm">
                    {employee.nama}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-sm">
                    {employee.employee_id}
                  </td>
                  <td className="px-3 py-3 text-gray-900 text-sm">
                    {employee.position_name || "-"}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-sm">
                    {employee.dept_abbr}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-sm">
                    {employee.company_name}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-sm">
                    {employee.title}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-sm">
                    {employee.author || "-"}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-sm">
                    {employee.category_name || "-"}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-sm">
                    {employee.subcategory_name || "-"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        employee.status
                      )}`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-600 font-mono text-sm">
                    {employee.total_time?.split(".")[0] || "-"}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-sm">
                    {employee.average_minutes
                      ? `${employee.average_minutes} min`
                      : "-"}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-sm">
                    {employee.start_time
                      ? new Date(employee.start_time).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="14"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 w-full">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            className="rounded border border-gray-300 text-gray-600 focus:ring-blue-500 focus:outline-none py-1 px-2 w-full"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {filteredEmployees.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(endIndex, filteredEmployees.length)} of{" "}
            {filteredEmployees.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
