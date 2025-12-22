import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function OnlineLearningView({ onlineLearning }) {
  const [selectedOnlineLearning, setSelectedOnlineLearning] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCompanyUnit, setSelectedCompanyUnit] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const company_names = [...new Set(onlineLearning.map((e) => e.company_name))];
  const dept_abbrs = [...new Set(onlineLearning.map((e) => e.dept_abbr))];
  const courses = [...new Set(onlineLearning.map((e) => e.course_title))];
  const statuses = [...new Set(onlineLearning.map((e) => e.status))];
  const start_times = [
    ...new Set(
      onlineLearning.map((e) =>
        new Date(e.issue_date).toLocaleDateString("id-ID")
      )
    ),
  ].sort();

  const filteredOnlineLearning = onlineLearning.filter((onlineLearning) => {
    const matchSearch =
      (onlineLearning.nama?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (onlineLearning.no_ktp || "").includes(searchQuery) ||
      (onlineLearning.position_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (onlineLearning.dept_abbr?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );

    const matchCompanyUnit =
      !selectedCompanyUnit ||
      onlineLearning.company_name === selectedCompanyUnit;
    const matchDepartment =
      !selectedDepartment || onlineLearning.dept_abbr === selectedDepartment;
    const matchCourse =
      !selectedCourse || onlineLearning.course_title === selectedCourse;
    const matchStatus =
      !selectedStatus || onlineLearning.status === selectedStatus;
    const matchDate =
      !selectedDate ||
      new Date(onlineLearning.issue_date).toLocaleDateString("id-ID") ===
        selectedDate;

    return (
      matchSearch &&
      matchCompanyUnit &&
      matchDepartment &&
      matchCourse &&
      matchStatus &&
      matchDate
    );
  });

  const totalPages = Math.ceil(filteredOnlineLearning.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOnlineLearning = filteredOnlineLearning.slice(
    startIndex,
    endIndex
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedOnlineLearning(paginatedOnlineLearning.map((emp) => emp.id));
    } else {
      setSelectedOnlineLearning([]);
    }
  };

  const handleSelectOnlineLearning = (id, checked) => {
    if (checked) {
      setSelectedOnlineLearning([...selectedOnlineLearning, id]);
    } else {
      setSelectedOnlineLearning(
        selectedOnlineLearning.filter((empId) => empId !== id)
      );
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
      case "Passed":
        return "bg-green-500 text-white-800";
      case "Failed":
        return "bg-red-500 text-blue-white";
      default:
        return "bg-gray-500 text-gray-800";
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white">
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
          <select
            value={selectedCompanyUnit}
            onChange={(e) => {
              setSelectedCompanyUnit(e.target.value);
              handleFilterChange();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Company Unit</option>
            {company_names.map((unit) => (
              <option key={unit} value={unit}>
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
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Department</option>
            {dept_abbrs.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              handleFilterChange();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Course</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

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

          <select
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              handleFilterChange();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Date</option>
            {start_times.map((issue_date) => (
              <option key={issue_date} value={issue_date}>
                {issue_date}
              </option>
            ))}
          </select>

          {/* <button
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
          </button> */}
        </div>
      </div>

      {(selectedCompanyUnit ||
        selectedDepartment ||
        selectedOnlineLearning ||
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
          {selectedCourse && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2">
              {selectedCourse}
              <button
                onClick={() => selectedCourse("")}
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

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    selectedOnlineLearning.length ===
                      paginatedOnlineLearning.length &&
                    paginatedOnlineLearning.length > 0
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
                Course Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Pretest
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Posttest
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Status
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Course Attempt
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Date
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Refreshment Date
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedOnlineLearning.length > 0 ? (
              paginatedOnlineLearning.map((onlineLearning) => (
                <tr
                  key={onlineLearning.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOnlineLearning.includes(
                        onlineLearning.id
                      )}
                      onChange={(e) =>
                        handleSelectOnlineLearning(
                          onlineLearning.id,
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {onlineLearning.nama}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {onlineLearning.no_ktp}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {onlineLearning.position_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {onlineLearning.dept_abbr}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {onlineLearning.company_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {onlineLearning.course_title}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        onlineLearning.status
                      )}`}
                    >
                      {onlineLearning.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {onlineLearning.score}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(onlineLearning.issue_date).toLocaleDateString(
                      "id-ID"
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(
                      onlineLearning.expiration_date
                    ).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No Online Learning found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
            {Math.min(endIndex, filteredOnlineLearning.length)} of{" "}
            {filteredOnlineLearning.length}
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
