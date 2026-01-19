import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  X,
  Calendar
} from "lucide-react";
import ExcelJS from "exceljs";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { useDebounce } from "@/hooks/useDebounce";
import { ReportTableSkeleton } from "@/components/Loading/Skeleton";

export default function OnlineLearningView({ 
  onlineLearning = [], 
  pagination,
  loading,
  error,
  onFetch 
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateFrom, setDateFrom] = useState(""); // ✅ Date From
  const [dateTo, setDateTo] = useState("");     // ✅ Date To

  const { showWarning, showSuccess, showError } = useSweetAlert();

  // ✅ Get unique values from ALL data (untuk dropdown options)
  const [allData, setAllData] = useState([]);
  
  useEffect(() => {
    if (onlineLearning.length > 0) {
      setAllData(onlineLearning);
    }
  }, [onlineLearning]);

  const companies = [...new Set(allData.map((e) => e.company_name))].filter(Boolean);
  const departments = [...new Set(allData.map((e) => e.dept_abbr))].filter(Boolean);
  const courses = [...new Set(allData.map((e) => e.course_title))].filter(Boolean);
  const statuses = [...new Set(allData.map((e) => e.status))].filter(Boolean);

  // ✅ Fetch data with server-side filters
  useEffect(() => {
    const filters = {
      search: debouncedSearch,
      company_name: selectedCompany,
      dept_abbr: selectedDepartment,
      course_title: selectedCourse,
      status: selectedStatus,
      date_from: dateFrom,  // ✅ Send to backend
      date_to: dateTo       // ✅ Send to backend
    };
    
    onFetch(currentPage, pageSize, filters);
  }, [currentPage, pageSize, debouncedSearch, selectedCompany, selectedDepartment, selectedCourse, selectedStatus, dateFrom, dateTo]);

  // ✅ Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCompany, selectedDepartment, selectedCourse, selectedStatus, dateFrom, dateTo]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(onlineLearning.map((item) => item.id_user_enrollment));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCompany("");
    setSelectedDepartment("");
    setSelectedCourse("");
    setSelectedStatus("");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Passed":
        return "bg-green-500 text-white";
      case "Failed":
        return "bg-red-500 text-white";
      case "In Progress":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const activeFiltersCount = [
    selectedCompany,
    selectedDepartment,
    selectedCourse,
    selectedStatus,
    dateFrom,
    dateTo
  ].filter(Boolean).length;

  // ✅ Format date for display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // ✅ Export to Excel (selected items only)
  const handleExportExcel = async () => {
    if (selectedItems.length === 0) {
      showWarning("Please select at least one record to export");
      return;
    }

    try {
      const selectedData = onlineLearning.filter((item) =>
        selectedItems.includes(item.id_user_enrollment)
      );

      if (!selectedData.length) {
        showWarning("Selected data not found");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Online Learning Report", {
        views: [{ state: "frozen", ySplit: 1 }],
      });

      worksheet.columns = [
        { header: "No", key: "no", width: 6 },
        { header: "Company Unit", key: "company", width: 28 },
        { header: "Department", key: "dept", width: 12 },
        { header: "Employee ID", key: "empId", width: 14 },
        { header: "Employee Name", key: "name", width: 28 },
        { header: "Position", key: "position", width: 18 },
        { header: "Course Name", key: "course", width: 35 },
        { header: "Pretest", key: "pretest", width: 10 },
        { header: "Posttest", key: "posttest", width: 10 },
        { header: "Status", key: "status", width: 12 },
        { header: "Course Attempt", key: "attempt", width: 14 },
        { header: "Date", key: "date", width: 14 },
        { header: "Refreshment Date", key: "refDate", width: 18 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });

      selectedData.forEach((item, index) => {
        const row = worksheet.addRow({
          no: index + 1,
          company: item.company_name || "-",
          dept: item.dept_abbr || "-",
          empId: item.employee_id || item.no_ktp || "-",
          name: item.full_name || "-",
          position: item.position_name || "-",
          course: item.course_title || "-",
          pretest: item.pretest ?? "-",
          posttest: item.posttest ?? "-",
          status: item.status || "-",
          attempt: item.course_attempt ?? "-",
          date: item.date ? new Date(item.date) : "-",
          refDate: item.refreshment_date ? new Date(item.refreshment_date) : "-",
        });

        const statusCell = row.getCell(10);
        if (item.status === "Passed") {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00B050" },
          };
          statusCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        } else if (item.status === "Failed") {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF0000" },
          };
          statusCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        }
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };

          if ([1, 3, 4, 8, 9, 10, 11, 12, 13].includes(colNumber)) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
          }
        });
      });

      worksheet.getColumn("date").numFmt = "dd-mm-yyyy";
      worksheet.getColumn("refDate").numFmt = "dd-mm-yyyy";

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

      a.download = `Online_Learning_Report_${dateStr}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      showSuccess(`Successfully exported ${selectedData.length} records to Excel`);
      setSelectedItems([]);
    } catch (error) {
      console.error("Export error:", error);
      showError("Failed to export to Excel. Please try again.");
    }
  };

  if (loading) {
    return <ReportTableSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => onFetch(1, 10)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-white rounded-lg">
      {/* Header with Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Top Row: Search + Export */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search name, employee ID, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {searchQuery !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          <button
            onClick={handleExportExcel}
            disabled={selectedItems.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
          >
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
            {selectedItems.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-green-700 rounded-full text-xs">
                {selectedItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* ✅ Date Range Picker */}
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar size={16} className="text-gray-500" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm focus:outline-none bg-transparent"
              placeholder="From"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-sm focus:outline-none bg-transparent"
              placeholder="To"
            />
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-800 font-medium hover:underline"
            >
              Clear all ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Badges */}
      {activeFiltersCount > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-600">Active filters:</span>
          {selectedCompany && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Company: {selectedCompany}
              <button onClick={() => setSelectedCompany("")} className="hover:text-blue-900">
                <X size={14} />
              </button>
            </span>
          )}
          {selectedDepartment && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Dept: {selectedDepartment}
              <button onClick={() => setSelectedDepartment("")} className="hover:text-green-900">
                <X size={14} />
              </button>
            </span>
          )}
          {selectedCourse && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Course: {selectedCourse}
              <button onClick={() => setSelectedCourse("")} className="hover:text-purple-900">
                <X size={14} />
              </button>
            </span>
          )}
          {selectedStatus && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              Status: {selectedStatus}
              <button onClick={() => setSelectedStatus("")} className="hover:text-orange-900">
                <X size={14} />
              </button>
            </span>
          )}
          {(dateFrom || dateTo) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
              <Calendar size={12} />
              {dateFrom && formatDateDisplay(dateFrom)}
              {dateFrom && dateTo && ' - '}
              {dateTo && formatDateDisplay(dateTo)}
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="hover:text-pink-900">
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr className="border-b border-gray-200">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === onlineLearning.length && onlineLearning.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Position</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Course Name</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Pretest</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Posttest</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Attempt</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Refreshment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {onlineLearning.length > 0 ? (
                onlineLearning.map((item, index) => (
                  <tr
                    key={item.id_user_enrollment}
                    className={`hover:bg-blue-50 transition-colors ${
                      selectedItems.includes(item.id_user_enrollment) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id_user_enrollment)}
                        onChange={(e) => handleSelectItem(item.id_user_enrollment, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">{item.full_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{item.employee_id || item.no_ktp}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{item.position_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {item.dept_abbr}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 max-w-[180px] truncate" title={item.company_name}>
                        {item.company_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 max-w-[250px] truncate" title={item.course_title}>
                        {item.course_title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-600">{item.pretest ?? '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-600">{item.posttest ?? '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-600">{item.course_attempt ?? '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {item.date ? new Date(item.date).toLocaleDateString("id-ID") : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {item.refreshment_date ? new Date(item.refreshment_date).toLocaleDateString("id-ID") : '-'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium mb-1">
                        {activeFiltersCount > 0 || searchQuery ? "No results found" : "No online learning data"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {activeFiltersCount > 0 || searchQuery 
                          ? "Try adjusting your filters or search query"
                          : "Get started by enrolling employees in courses"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            className="py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{pagination?.totalCount > 0 ? ((pagination.currentPage - 1) * pagination.pageSize) + 1 : 0}</span> to{" "}
            <span className="font-semibold text-gray-900">{Math.min(pagination?.currentPage * pagination?.pageSize, pagination?.totalCount)}</span> of{" "}
            <span className="font-semibold text-gray-900">{pagination?.totalCount || 0}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700">
              Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= (pagination?.totalPages || 1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}