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
import API from '../../services/api';
import { useMenuPermissions } from '@/hooks/useMenuPermissions';

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
  const permissions = useMenuPermissions();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { showWarning, showSuccess, showError } = useSweetAlert();

  // ✅ State untuk master data filters
  const [filterOptions, setFilterOptions] = useState({
    companies: [],    // [{id: 1, name: "PT ABC"}]
    departments: [],  // [{id: 2, name: "IT"}]
    courses: [],      // [{id: 3, name: "Safety Training"}]
    statuses: ["Passed", "Failed", "In Progress"] // Static
  });

  // ✅ Fetch master data untuk filters saat component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch dengan limit besar atau endpoint khusus untuk master data
        const response = await API.get('/report/online-learning', { 
                    params: { page: 1, limit: 99999 } 
                });
        
        const data = response.data.data || [];
        
        // Build unique lists dengan ID dan Name
        const uniqueCompanies = [];
        const uniqueDepartments = [];
        const uniqueCourses = [];
        
        const companySet = new Set();
        const deptSet = new Set();
        const courseSet = new Set();
        
        data.forEach(item => {
          // Companies
          if (item.company_id && item.company_name && !companySet.has(item.company_id)) {
            companySet.add(item.company_id);
            uniqueCompanies.push({
              id: item.company_id,
              name: item.company_name
            });
          }
          
          // Departments
          if (item.department_id && item.dept_abbr && !deptSet.has(item.department_id)) {
            deptSet.add(item.department_id);
            uniqueDepartments.push({
              id: item.department_id,
              name: item.dept_abbr
            });
          }
          
          // Courses
          if (item.id_course && item.course_title && !courseSet.has(item.id_course)) {
            courseSet.add(item.id_course);
            uniqueCourses.push({
              id: item.id_course,
              name: item.course_title
            });
          }
        });
        
        // Sort alphabetically
        uniqueCompanies.sort((a, b) => a.name.localeCompare(b.name));
        uniqueDepartments.sort((a, b) => a.name.localeCompare(b.name));
        uniqueCourses.sort((a, b) => a.name.localeCompare(b.name));
        
        setFilterOptions({
          companies: uniqueCompanies,
          departments: uniqueDepartments,
          courses: uniqueCourses,
          statuses: ["Passed", "Failed", "In Progress"]
        });
        
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };
    
    fetchFilterOptions();
  }, []); // Run once on mount

  // ✅ Fetch data with filters
  useEffect(() => {
    const filters = {
      search: debouncedSearch,
      company_id: selectedCompanyId,
      department_id: selectedDeptId,
      id_course: selectedCourseId,
      status: selectedStatus,
      start_date: startDate,
      end_date: endDate,
      status: selectedStatus
    };
    
    onFetch(currentPage, pageSize, filters);
  }, [currentPage, pageSize, debouncedSearch, selectedCompanyId, selectedDeptId, selectedCourseId, selectedStatus, startDate, endDate]);

  // ✅ Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCompanyId, selectedDeptId, selectedCourseId, selectedStatus, startDate, endDate]);


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
    setSelectedCompanyId("");
    setSelectedDeptId("");
    setSelectedCourseId("");
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
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
    selectedCompanyId,
    selectedDeptId,
    selectedCourseId,
    selectedStatus,
    startDate,
    endDate
  ].filter(Boolean).length;

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // ✅ Helper to get name from ID (menggunakan == untuk type coercion)
  const getCompanyName = (id) => {
    if (!id) return '';
    const company = filterOptions.companies.find(c => c.id == id); // ✅ == instead of ===
    return company ? company.name : `Company ${id}`;
  };

  const getDeptName = (id) => {
    if (!id) return '';
    const dept = filterOptions.departments.find(d => d.id == id); // ✅ == instead of ===
    return dept ? dept.name : `Dept ${id}`;
  };

  const getCourseName = (id) => {
    if (!id) return '';
    const course = filterOptions.courses.find(c => c.id == id); // ✅ == instead of ===
    return course ? course.name : `Course ${id}`;
  };

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

      // ✅ UPDATE: Kolom Excel
      worksheet.columns = [
        { header: "No", key: "no", width: 6 },
        { header: "Company Unit", key: "company", width: 28 },
        { header: "Department", key: "dept", width: 12 },
        { header: "Employee ID", key: "empId", width: 14 },
        { header: "Employee Name", key: "name", width: 28 },
        { header: "Position", key: "position", width: 18 },
        { header: "Course Name", key: "course", width: 35 },
        { header: "Published Date", key: "publishDate", width: 16 },
        { header: "End Date", key: "endDate", width: 16 },
        { header: "Started At", key: "startedAt", width: 18 },
        { header: "Completed At", key: "completedAt", width: 18 },
        { header: "Pretest", key: "pretest", width: 10 },
        { header: "Posttest", key: "posttest", width: 10 },
        { header: "Status", key: "status", width: 12 },
        { header: "Course Attempt", key: "attempt", width: 14 },
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
          publishDate: item.publish_date ? new Date(item.publish_date) : "-",
          endDate: item.end_date ? new Date(item.end_date) : "-",
          startedAt: item.started_at ? new Date(item.started_at) : "-",
          completedAt: item.completed_at ? new Date(item.completed_at) : "-",
          pretest: item.pretest ?? "-",
          posttest: item.posttest ?? "-",
          status: item.status || "-",
          attempt: item.course_attempt ?? "-",
          refDate: item.refreshment_date ? new Date(item.refreshment_date) : "-",
        });

        // ✅ UPDATE: Status cell index berubah ke kolom 14
        const statusCell = row.getCell(14);
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
        } else if (item.status === "In Progress") {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4472C4" },
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

          // ✅ UPDATE: Center alignment columns
          if ([1, 3, 4, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(colNumber)) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
          }
        });
      });

      // ✅ UPDATE: Format tanggal untuk kolom baru
      worksheet.getColumn("publishDate").numFmt = "dd-mm-yyyy";
      worksheet.getColumn("endDate").numFmt = "dd-mm-yyyy";
      worksheet.getColumn("startedAt").numFmt = "dd-mm-yyyy hh:mm";
      worksheet.getColumn("completedAt").numFmt = "dd-mm-yyyy hh:mm";
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

          {permissions.can_view && (
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
          )}
        </div>

        {/* ✅ Updated Filters Row - Pakai filterOptions */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Companies</option>
            {filterOptions.companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Departments</option>
            {filterOptions.departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Courses</option>
            {filterOptions.courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Status</option>
            {filterOptions.statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar size={16} className="text-gray-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm focus:outline-none bg-transparent"
              placeholder="From"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
          {selectedCompanyId && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Company: {getCompanyName(selectedCompanyId)}
              <button onClick={() => setSelectedCompanyId("")} className="hover:text-blue-900">
                <X size={14} />
              </button>
            </span>
          )}
          {selectedDeptId && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Dept: {getDeptName(selectedDeptId)}
              <button onClick={() => setSelectedDeptId("")} className="hover:text-green-900">
                <X size={14} />
              </button>
            </span>
          )}
          {selectedCourseId && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Course: {getCourseName(selectedCourseId)}
              <button onClick={() => setSelectedCourseId("")} className="hover:text-purple-900">
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
          {(startDate || endDate) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
              <Calendar size={12} />
              {startDate && formatDateDisplay(startDate)}
              {startDate && endDate && ' - '}
              {endDate && formatDateDisplay(endDate)}
              <button onClick={() => { setStartDate(""); setEndDate(""); }} className="hover:text-pink-900">
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Table - No changes needed */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] w-full">
            {/* ... Table content sama seperti sebelumnya ... */}
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr className="border-b border-gray-200">
                {permissions.can_view && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === onlineLearning.length && onlineLearning.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Position</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Course Name</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Published Date</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">End Date</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Started At</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Completed At</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Pretest</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Posttest</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Attempt</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Refreshment</th>
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
                    {permissions.can_view && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id_user_enrollment)}
                          onChange={(e) => handleSelectItem(item.id_user_enrollment, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
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
                    
                    {/* ✅ UBAH: Kolom Published Date */}
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm text-gray-600">
                        {item.publish_date ? new Date(item.publish_date).toLocaleDateString("id-ID", {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : '-'}
                      </div>
                    </td>
                    
                    {/* ✅ UBAH: Kolom End Date */}
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm text-gray-600">
                        {item.end_date ? new Date(item.end_date).toLocaleDateString("id-ID", {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : '-'}
                      </div>
                    </td>
                    
                    {/* ✅ TAMBAH: Kolom Started At */}
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm text-gray-600">
                        {item.started_at ? (
                          <div className="flex flex-col">
                            <span>{new Date(item.started_at).toLocaleDateString("id-ID", {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(item.started_at).toLocaleTimeString("id-ID", {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not started</span>
                        )}
                      </div>
                    </td>
                    
                    {/* ✅ TAMBAH: Kolom Completed At */}
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm text-gray-600">
                        {item.completed_at ? (
                          <div className="flex flex-col">
                            <span>{new Date(item.completed_at).toLocaleDateString("id-ID", {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(item.completed_at).toLocaleTimeString("id-ID", {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not completed</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-gray-900">{item.pretest ?? '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-gray-900">{item.posttest ?? '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-gray-600">{item.course_attempt ?? '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm text-gray-600">
                        {item.refreshment_date ? new Date(item.refreshment_date).toLocaleDateString("id-ID", {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : '-'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="16" className="px-4 py-12 text-center">
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

      {/* Pagination - No changes needed */}
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