import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, FileDown } from "lucide-react";

export default function Monitoring({ employees }) {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [selectedCompanyUnit, setSelectedCompanyUnit] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEbook, setSelectedEbook] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Get unique values for filters
  const company_names = [...new Set(employees.map((e) => e.company_name))];
  const dept_abbrs = [...new Set(employees.map((e) => e.dept_abbr))];
  const ebooks = [...new Set(employees.map((e) => e.title))];
  const statuses = [...new Set(employees.map((e) => e.status))];
  const start_times = [
    ...new Set(
      employees.map((e) => new Date(e.start_time).toLocaleDateString("id-ID"))
    ),
  ].sort();

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchSearch =
      (employee.nama?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (employee.no_ktp || "").includes(searchQuery) ||
      (employee.position?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );

    const matchCompanyUnit =
      !selectedCompanyUnit || employee.company_name === selectedCompanyUnit;
    const matchDepartment =
      !selectedDepartment || employee.dept_abbr === selectedDepartment;
    const matchEbook = !selectedEbook || employee.title === selectedEbook;
    const matchStatus = !selectedStatus || employee.status === selectedStatus;
    const matchDate =
      !selectedDate ||
      new Date(employee.start_time).toLocaleDateString("id-ID") ===
        selectedDate;

    return (
      matchSearch &&
      matchCompanyUnit &&
      matchDepartment &&
      matchEbook &&
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
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportToPDF = () => {
    if (selectedEmployees.length === 0) {
      alert("Please select at least one employee to export");
      return;
    }

    // Get selected employees data
    const selectedData = employees.filter((emp) =>
      selectedEmployees.includes(emp.id)
    );

    // Create PDF content
    let pdfContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Employee eBook Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; text-align: center; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; font-size: 12px; }
                    th { background-color: #f3f4f6; font-weight: 600; color: #374151; }
                    tr:nth-child(even) { background-color: #f9fafb; }
                    .status-done { background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; display: inline-block; }
                    .status-read { background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; display: inline-block; }
                    .status-not-started { background-color: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; display: inline-block; }
                    .export-info { text-align: center; color: #6b7280; margin-bottom: 20px; font-size: 14px; }
                </style>
            </head>
            <body>
                <h1>Employee eBook Reading Report</h1>
                <div class="export-info">
                    <p>Export Date: ${new Date().toLocaleDateString(
                      "en-GB"
                    )} | Total Records: ${selectedData.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Name</th>
                            <th>Employee ID</th>
                            <th>Position</th>
                            <th>Department</th>
                            <th>Company Unit</th>
                            <th>eBook Title</th>
                            <th>Status Read</th>
                            <th>Total Time</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${selectedData
                          .map(
                            (emp, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${emp.nama}</td>
                                <td>${emp.no_ktp}</td>
                                <td>${emp.position}</td>
                                <td>${emp.dept_abbr}</td>
                                <td>${emp.company_name}</td>
                                <td>${emp.title}</td>
                                <td><span class="status-${emp.status
                                  .toLowerCase()
                                  .replace(" ", "-")}">${emp.status}</span></td>
                                <td>${emp.total_time}</td>
                                <td>${emp.start_time}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </body>
            </html>
                    `;
  };

  return (
    <div className="w-full mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-6">
        <div className="flex items-center gap-6 flex-1 min-w-0">
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
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Company Unit Filter */}
          <select
            value={selectedCompanyUnit}
            onChange={(e) => {
              setSelectedCompanyUnit(e.target.value);
              handleFilterChange();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Company Units</option>
            {company_names.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              handleFilterChange();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {dept_abbrs.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* eBook Filter */}
          <select
            value={selectedEbook}
            onChange={(e) => {
              setSelectedEbook(e.target.value);
              handleFilterChange();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All eBooks</option>
            {ebooks.map((ebook) => (
              <option key={ebook} value={ebook}>
                {ebook}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              handleFilterChange();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              handleFilterChange();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Dates</option>
            {start_times.map((start_time) => (
              <option key={start_time} value={start_time}>
                {start_time}
              </option>
            ))}
          </select>

          {/* Export PDF Button */}
          <button
            onClick={exportToPDF}
            disabled={selectedEmployees.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <FileDown size={16} />
            <span>Export PDF</span>
            {selectedEmployees.length > 0 && (
              <span className="bg-white text-green-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                {selectedEmployees.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedCompanyUnit ||
        selectedDepartment ||
        selectedEbook ||
        selectedStatus) && (
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
          {selectedDate && (
            <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm flex items-center gap-2">
              {selectedDate}
              <button
                onClick={() => setSelectedDate("")}
                className="hover:text-pink-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3">
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
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Employee ID
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Position
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Department
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Company Unit
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                eBook Title
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Status Read
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Total Time
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={(e) =>
                        handleSelectEmployee(employee.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {employee.nama}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{employee.no_ktp}</td>
                  <td className="px-4 py-3 text-gray-900">
                    {employee.position}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {employee.dept_abbr}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {employee.company_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{employee.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        employee.status
                      )}`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-sm">
                    {employee.total_time?.split(".")[0] || ""}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(employee.start_time).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
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
            Showing {startIndex + 1} to{" "}
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
