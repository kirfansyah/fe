import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { CirclePlus, AlertCircle, CheckCircle, Edit } from "lucide-react";
import { useReport } from "../../hooks/useReport";

export default function OfflineLearningView({
  offlineLearning,
  onSave,
  onUpdate,
  position,
  dept,
  company,
}) {
  const [selectedOfflineLearning, setSelectedOfflineLearning] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCompanyUnit, setSelectedCompanyUnit] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const company_names = [
    ...new Set(offlineLearning.map((e) => e.company_name)),
  ];
  const dept_abbrs = [...new Set(offlineLearning.map((e) => e.dept_abbr))];
  const courses = [...new Set(offlineLearning.map((e) => e.training_title))];
  const statuses = [...new Set(offlineLearning.map((e) => e.status))];
  const start_times = [
    ...new Set(
      offlineLearning.map((e) =>
        new Date(e.issue_date).toLocaleDateString("id-ID")
      )
    ),
  ].sort();

  const filteredOfflineLearning = offlineLearning.filter((offlineLearning) => {
    const matchSearch =
      (offlineLearning.nama?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (offlineLearning.employee_id || "").includes(searchQuery) ||
      (offlineLearning.position_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (offlineLearning.dept_abbr?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );

    const matchCompanyUnit =
      !selectedCompanyUnit ||
      offlineLearning.company_name === selectedCompanyUnit;
    const matchDepartment =
      !selectedDepartment || offlineLearning.dept_abbr === selectedDepartment;
    const matchCourse =
      !selectedCourse || offlineLearning.training_title === selectedCourse;
    const matchStatus =
      !selectedStatus || offlineLearning.status === selectedStatus;
    const matchDate =
      !selectedDate ||
      new Date(offlineLearning.issue_date).toLocaleDateString("id-ID") ===
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

  const totalPages = Math.ceil(filteredOfflineLearning.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOfflineLearning = filteredOfflineLearning.slice(
    startIndex,
    endIndex
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedOfflineLearning(
        paginatedOfflineLearning.map((emp) => emp.id_training_certificate)
      );
    } else {
      setSelectedOfflineLearning([]);
    }
  };

  const handleSelectOfflineLearning = (id, checked) => {
    if (checked) {
      setSelectedOfflineLearning([...selectedOfflineLearning, id]);
    } else {
      setSelectedOfflineLearning(
        selectedOfflineLearning.filter((empId) => empId !== id)
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

  const { fetchEmployee } = useReport();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCertificateId, setCurrentCertificateId] = useState(null);
  const [employeeId, setemployeeId] = useState("");
  const [employeeName, setemployeeName] = useState("");
  const [employeePosition, setemployeePosition] = useState("");
  const [employeeDept, setemployeeDept] = useState("");
  const [employeeComp, setemployeeComp] = useState("");
  const [trainingTitle, settrainingTitle] = useState("");
  const [provider, setprovider] = useState("");
  const [certificateId, setcertificateId] = useState("");
  const [certificateUrl, setcertificateUrl] = useState("");
  const [issueDate, setissueDate] = useState("");
  const [expiredDate, setexpiredDate] = useState("");
  const [uploadCertificate, setuploadCertificate] = useState(null);
  const [existingCertificate, setExistingCertificate] = useState("");

  const [errors, setErrors] = useState({
    employeeId: "",
    employeeName: "",
    employeePosition: "",
    employeeDept: "",
    employeeComp: "",
    trainingTitle: "",
    provider: "",
    certificateId: "",
    certificateUrl: "",
    issueDate: "",
    expiredDate: "",
    uploadCertificate: "",
  });

  const [touched, setTouched] = useState({
    employeeId: false,
    employeeName: false,
    employeePosition: false,
    employeeDept: false,
    employeeComp: false,
    trainingTitle: false,
    provider: false,
    certificateId: false,
    certificateUrl: false,
    issueDate: false,
    expiredDate: false,
    uploadCertificate: false,
  });

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCurrentCertificateId(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (offlineLearning) => {
    setIsEditMode(true);
    setCurrentCertificateId(offlineLearning.id_training_certificate);

    // Populate form with existing data
    setemployeeId(offlineLearning.employee_id || "");
    setemployeeName(offlineLearning.full_name || "");
    setemployeePosition(offlineLearning.position_id?.toString() || "");
    setemployeeDept(offlineLearning.department_id?.toString() || "");
    setemployeeComp(offlineLearning.company_id?.toString() || "");
    settrainingTitle(offlineLearning.training_title || "");
    setprovider(offlineLearning.issuing_organization || "");
    setcertificateId(offlineLearning.credential_id || "");
    setcertificateUrl(offlineLearning.credential_url || "");
    setissueDate(offlineLearning.issue_date || "");
    setexpiredDate(offlineLearning.expiration_date || "");
    setExistingCertificate(offlineLearning.certificate_url || "");
    setuploadCertificate(null);
    setIsModalOpen(true);
  };

  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "employeeId":
        if (!value || value.trim() === "") {
          error = "Employee ID is required";
        }
        break;

      case "employeeName":
        if (!value || value.trim() === "") {
          error = "Employee name is required";
        }
        break;

      case "employeePosition":
        if (!value) {
          error = "Employee position is required";
        }
        break;

      case "employeeDept":
        if (!value) {
          error = "Employee department is required";
        }
        break;

      case "employeeComp":
        if (!value) {
          error = "Company is required";
        }
        break;

      case "trainingTitle":
        if (!value || value.trim() === "") {
          error = "Training title is required";
        }
        break;

      case "provider":
        if (!value || value.trim() === "") {
          error = "Provider is required";
        }
        break;

      case "certificateUrl":
        if (!value || value.trim() === "") {
          error = "Credential URL is required";
        }
        break;

      case "certificateId":
        if (!value || value.trim() === "") {
          error = "Credential ID is required";
        }
        break;

      case "issueDate":
        if (!value) {
          error = "Issue date is required";
        }
        break;

      case "expiredDate":
        if (!value) {
          error = "Expired date is required";
        }
        break;

      case "uploadCertificate":
        if (!isEditMode && !value) {
          error = "Certificate file is required";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    let value = "";

    switch (fieldName) {
      case "employeeId":
        value = employeeId;
        break;
      case "employeeName":
        value = employeeName;
        break;
      case "employeePosition":
        value = employeePosition;
        break;
      case "employeeDept":
        value = employeeDept;
        break;
      case "employeeComp":
        value = employeeComp;
        break;
      case "trainingTitle":
        value = trainingTitle;
        break;
      case "provider":
        value = provider;
        break;
      case "certificateId":
        value = certificateId;
        break;
      case "certificateUrl":
        value = certificateUrl;
        break;
      case "issueDate":
        value = issueDate;
        break;
      case "expiredDate":
        value = expiredDate;
        break;
      case "uploadCertificate":
        value = uploadCertificate;
        break;
      default:
        break;
    }

    const error = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const handleEmployeeIdChange = (e) => {
    const value = e.target.value;
    setemployeeId(value);

    if (touched.employeeId) {
      const error = validateField("employeeId", value);
      setErrors((prev) => ({ ...prev, employeeId: error }));
    }
  };

  const handleEmployeeNameChange = (e) => {
    const value = e.target.value;
    setemployeeName(value);

    if (touched.employeeName) {
      const error = validateField("employeeName", value);
      setErrors((prev) => ({ ...prev, employeeName: error }));
    }
  };

  const handleEmployeePositionChange = (e) => {
    const value = e.target.value;
    setemployeePosition(value);

    if (touched.employeePosition) {
      const error = validateField("employeePosition", value);
      setErrors((prev) => ({ ...prev, employeePosition: error }));
    }
  };

  const handleEmployeeDeptChange = (e) => {
    const value = e.target.value;
    setemployeeDept(value);

    if (touched.employeeDept) {
      const error = validateField("employeeDept", value);
      setErrors((prev) => ({ ...prev, employeeDept: error }));
    }
  };

  const handleEmployeeCompChange = (e) => {
    const value = e.target.value;
    setemployeeComp(value);

    if (touched.employeeComp) {
      const error = validateField("employeeComp", value);
      setErrors((prev) => ({ ...prev, employeeComp: error }));
    }
  };

  const handleTrainingTitleChange = (e) => {
    const value = e.target.value;
    settrainingTitle(value);

    if (touched.trainingTitle) {
      const error = validateField("trainingTitle", value);
      setErrors((prev) => ({ ...prev, trainingTitle: error }));
    }
  };

  const handleProviderChange = (e) => {
    const value = e.target.value;
    setprovider(value);

    if (touched.provider) {
      const error = validateField("provider", value);
      setErrors((prev) => ({ ...prev, provider: error }));
    }
  };

  const handleCertificateIdChange = (e) => {
    const value = e.target.value;
    setcertificateId(value);

    if (touched.certificateId) {
      const error = validateField("certificateId", value);
      setErrors((prev) => ({ ...prev, certificateId: error }));
    }
  };

  const handleCertificateUrlChange = (e) => {
    const value = e.target.value;
    setcertificateUrl(value);

    if (touched.certificateUrl) {
      const error = validateField("certificateUrl", value);
      setErrors((prev) => ({ ...prev, certificateUrl: error }));
    }
  };

  const handleIssueDateChange = (e) => {
    const value = e.target.value;
    setissueDate(value);

    if (touched.issueDate) {
      const error = validateField("issueDate", value);
      setErrors((prev) => ({ ...prev, issueDate: error }));
    }
  };

  const handleExpiredDateChange = (e) => {
    const value = e.target.value;
    setexpiredDate(value);

    if (touched.expiredDate) {
      const error = validateField("expiredDate", value);
      setErrors((prev) => ({ ...prev, expiredDate: error }));
    }
  };

  const handleUploadCertificateChange = (e) => {
    const file = e.target.files[0];
    setuploadCertificate(file);
    console.log(file);

    if (touched.uploadCertificate) {
      const error = validateField("uploadCertificate", file);
      setErrors((prev) => ({ ...prev, uploadCertificate: error }));
    }
  };

  const validateAll = () => {
    const employeeIdError = validateField("employeeId", employeeId);
    const employeeNameError = validateField("employeeName", employeeName);
    const employeePositionError = validateField(
      "employeePosition",
      employeePosition
    );
    const employeeDeptError = validateField("employeeDept", employeeDept);
    const employeeCompError = validateField("employeeComp", employeeComp);
    const trainingTitleError = validateField("trainingTitle", trainingTitle);
    const providerError = validateField("provider", provider);
    const certificateIdError = validateField("certificateId", certificateId);
    const certificateUrlError = validateField("certificateUrl", certificateUrl);
    const issueDateError = validateField("issueDate", issueDate);
    const expiredDateError = validateField("expiredDate", expiredDate);
    const uploadCertificateError = validateField(
      "uploadCertificate",
      uploadCertificate
    );

    // set all errors
    setErrors({
      employeeId: employeeIdError,
      employeeName: employeeNameError,
      employeePosition: employeePositionError,
      employeeDept: employeeDeptError,
      employeeComp: employeeCompError,
      trainingTitle: trainingTitleError,
      provider: providerError,
      certificateId: certificateIdError,
      issueDate: issueDateError,
      expiredDate: expiredDateError,
      uploadCertificate: uploadCertificateError,
    });

    // mark all fields touched
    setTouched({
      employeeId: true,
      employeeName: true,
      employeePosition: true,
      employeeDept: true,
      employeeComp: true,
      trainingTitle: true,
      provider: true,
      certificateId: true,
      issueDate: true,
      expiredDate: true,
      uploadCertificate: true,
    });

    return (
      !employeeIdError &&
      !employeeNameError &&
      !employeePositionError &&
      !employeeDeptError &&
      !employeeCompError &&
      !trainingTitleError &&
      !providerError &&
      !certificateIdError &&
      !issueDateError &&
      !expiredDateError &&
      !uploadCertificateError
    );
  };

  const getInputClass = (fieldName, baseClass) => {
    if (!touched[fieldName]) {
      return baseClass;
    }

    if (errors[fieldName]) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500`;
    }

    return `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500`;
  };

  const handleSave = async () => {
    if (!validateAll()) {
      return;
    }

    const offlineLearningData = {
      id_training_certificate: currentCertificateId,
      employee_id: employeeId,
      full_name: employeeName,
      position_id: employeePosition,
      department_id: employeeDept,
      company_id: employeeComp,
      training_title: trainingTitle,
      issuing_organization: provider,
      credential_id: certificateId,
      credential_url: certificateUrl,
      issue_date: issueDate,
      expiration_date: expiredDate,
      certificate: uploadCertificate,
      created_by: "Rahul",
      created_device: "PC Rahul",
    };

    try {
      if (isEditMode) {
        await onUpdate(currentCertificateId, offlineLearningData);
      } else {
        await onSave(offlineLearningData);
      }
      handleCancel();
    } catch (error) {
      console.error("Error saving ebook:", error);
    }
  };

  const resetForm = () => {
    setemployeeId("");
    setemployeeName("");
    setemployeePosition("");
    setemployeeDept("");
    setemployeeComp("");
    settrainingTitle("");
    setprovider("");
    setcertificateId("");
    setcertificateUrl("");
    setissueDate("");
    setexpiredDate("");
    setuploadCertificate(null);
    setExistingCertificate("");

    setErrors({
      employeeId: "",
      employeeName: "",
      employeePosition: "",
      employeeDept: "",
      employeeComp: "",
      trainingTitle: "",
      provider: "",
      certificateId: "",
      certificateUrl: "",
      issueDate: "",
      expiredDate: "",
      uploadCertificate: "",
    });

    setTouched({
      employeeId: false,
      employeeName: false,
      employeePosition: false,
      employeeDept: false,
      employeeComp: false,
      trainingTitle: false,
      provider: false,
      certificateId: false,
      certificateUrl: false,
      issueDate: false,
      expiredDate: false,
      uploadCertificate: false,
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentCertificateId(null);
  };

  useEffect(() => {
    if (!employeeComp || employeeId.length < 5) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetchEmployee(employeeComp, employeeId);

        if (res?.success && res.data) {
          setemployeeName(res.data.nama || "");
          setemployeePosition(res.data.position_id || "");
          setemployeeDept(res.data.department_id || "");
        }
      } catch (err) {
        console.warn("Employee not found");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [employeeComp, employeeId, fetchEmployee]);

  return (
    <div className="w-full mx-auto p-6 bg-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <button
          onClick={handleOpenAddModal}
          className="flex-shrink-0 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          + Add Data
        </button>

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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg 
                 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg 
                 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 
                 focus:ring-blue-500"
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
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg 
                 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 
                 focus:ring-blue-500"
          >
            <option value="">All Training</option>
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
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg 
                 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 
                 focus:ring-blue-500"
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
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg 
                 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 
                 focus:ring-blue-500"
          >
            <option value="">All Date</option>
            {start_times.map((issue_date) => (
              <option key={issue_date} value={issue_date}>
                {issue_date}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(selectedCompanyUnit ||
        selectedDepartment ||
        selectedCourse ||
        selectedStatus ||
        selectedDate) && (
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
                onClick={() => setSelectedCourse("")}
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

      <div className="border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-[1200px] w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Action
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
                Training Title
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Provider
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Certificate ID
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Issued Date
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                Refreshment Date
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">
                *Download lampiran
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedOfflineLearning.length > 0 ? (
              paginatedOfflineLearning.map((offlineLearning) => (
                <tr
                  key={offlineLearning.id_training_certificate}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-900">
                    <div className="flex items-center gap-2">
                      {/* Tombol Edit */}
                      <button
                        onClick={() => handleOpenEditModal(offlineLearning)}
                        className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-900">
                    {offlineLearning.full_name}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {offlineLearning.employee_id}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {offlineLearning.position_name}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {offlineLearning.dept_abbr}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {offlineLearning.company_name}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {offlineLearning.training_title}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {offlineLearning.issuing_organization}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {offlineLearning.credential_id}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {new Date(offlineLearning.issue_date).toLocaleDateString(
                      "id-ID"
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {new Date(
                      offlineLearning.expiration_date
                    ).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-left">
                    {offlineLearning.certificate ? (
                      <button
                        onClick={() =>
                          window.open(offlineLearning.certificate, "_blank")
                        }
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        📥 Download
                      </button>
                    ) : (
                      <span className="text-gray-400">Tidak ada</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No Offline Learning found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
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
            {Math.min(endIndex, filteredOfflineLearning.length)} of{" "}
            {filteredOfflineLearning.length}
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

      {/* Modal for Add & Edit Training Certificate */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancel}
        >
          <div
            className="rounded-xl border border-gray-200 bg-white shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-2 rounded-t-xl border-b bg-gradient-to-b from-gray-50 to-white px-6 py-4 flex-shrink-0">
              <CirclePlus className="h-6 w-6 text-green-600" />
              <h3 className="text-base font-semibold text-gray-900">
                {isEditMode
                  ? "Edit Training Certificate"
                  : "Add Training Certificate"}
              </h3>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-4 flex-1">
              <div className="space-y-4">
                <input
                  type="hidden"
                  value={currentCertificateId}
                  className={getInputClass(
                    "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                  )}
                  placeholder="Type Employee Name..."
                />
                {/* Company Unit */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Company Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <select
                      value={employeeComp}
                      onChange={(e) => setemployeeComp(e.target.value)}
                      className={getInputClass(
                        "employeeComp",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                    >
                      <option value="">Select Company...</option>
                      {company?.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.employeeComp && errors.employeeComp && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.employeeComp}</span>
                      </span>
                    )}
                    {touched.employeeComp &&
                      !errors.employeeComp &&
                      employeeDept && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* EMPLOYEE ID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setemployeeId(e.target.value)}
                      placeholder="Employee ID"
                      className={getInputClass(
                        "employeeId",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                    />
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.employeeId && errors.employeeId && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.employeeId}</span>
                      </span>
                    )}
                    {touched.employeeId && !errors.employeeId && employeeId && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Valid</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* EMPLOYEE NAME */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={employeeName}
                      onChange={handleEmployeeNameChange}
                      onBlur={() => handleBlur("employeeName")}
                      className={getInputClass(
                        "employeeName",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                      placeholder="Type Employee Name..."
                    />
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.employeeName && errors.employeeName && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.employeeName}</span>
                      </span>
                    )}
                    {touched.employeeName &&
                      !errors.employeeName &&
                      employeeName && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Position */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <select
                      value={employeePosition}
                      onChange={handleEmployeePositionChange}
                      onBlur={() => handleBlur("employeePosition")}
                      className={getInputClass(
                        "employeePosition",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                    >
                      <option value="">Select Position...</option>
                      {position?.map((position) => (
                        <option key={position.id} value={position.id}>
                          {position.position_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.employeePosition && errors.employeePosition && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {errors.employeePosition}
                        </span>
                      </span>
                    )}
                    {touched.employeePosition &&
                      !errors.employeePosition &&
                      employeePosition && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Department */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <select
                      value={employeeDept}
                      onChange={handleEmployeeDeptChange}
                      onBlur={() => handleBlur("employeeDept")}
                      className={getInputClass(
                        "employeeDept",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                    >
                      <option value="">Select Dept...</option>
                      {dept?.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.dept_abbr}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.employeeDept && errors.employeeDept && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.employeeDept}</span>
                      </span>
                    )}
                    {touched.employeeDept &&
                      !errors.employeeDept &&
                      employeeDept && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Training Title */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Training Title <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={trainingTitle}
                      onChange={handleTrainingTitleChange}
                      onBlur={() => handleBlur("trainingTitle")}
                      className={getInputClass(
                        "trainingTitle",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                      placeholder="Type Training Title..."
                    />
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.trainingTitle && errors.trainingTitle && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.trainingTitle}</span>
                      </span>
                    )}
                    {touched.trainingTitle &&
                      !errors.trainingTitle &&
                      trainingTitle && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Provider */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Provider <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={provider}
                      onChange={handleProviderChange}
                      onBlur={() => handleBlur("provider")}
                      className={getInputClass(
                        "provider",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                      placeholder="Type Provider..."
                    />
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.provider && errors.provider && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.provider}</span>
                      </span>
                    )}
                    {touched.provider && !errors.provider && provider && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Valid</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Credential ID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Credential ID <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={certificateId}
                      onChange={handleCertificateIdChange}
                      onBlur={() => handleBlur("certificateId")}
                      className={getInputClass(
                        "certificateId",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                      placeholder="Type Credential ID..."
                    />
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.certificateId && errors.certificateId && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.certificateId}</span>
                      </span>
                    )}
                    {touched.certificateId &&
                      !errors.certificateId &&
                      certificateId && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Credential URL */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Credential URL <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="text"
                      value={certificateUrl}
                      onChange={handleCertificateUrlChange}
                      onBlur={() => handleBlur("certificateUrl")}
                      className={getInputClass(
                        "certificateUrl",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                      placeholder="Type Credential URL..."
                    />
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.certificateUrl && errors.certificateUrl && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {errors.certificateUrl}
                        </span>
                      </span>
                    )}
                    {touched.certificateUrl &&
                      !errors.certificateUrl &&
                      certificateUrl && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Issued Date */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Issued Date <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="date"
                      value={issueDate}
                      onChange={handleIssueDateChange}
                      onBlur={() => handleBlur("issueDate")}
                      className={getInputClass(
                        "issueDate",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                      placeholder="Type Issued Date..."
                    />
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.issueDate && errors.issueDate && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.issueDate}</span>
                      </span>
                    )}
                    {touched.issueDate && !errors.issueDate && issueDate && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Valid</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Expired Date */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Expired Date <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="date"
                      value={expiredDate}
                      onChange={handleExpiredDateChange}
                      onBlur={() => handleBlur("expiredDate")}
                      className={getInputClass(
                        "expiredDate",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                      placeholder="Type Expired Date..."
                    />
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.expiredDate && errors.expiredDate && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{errors.expiredDate}</span>
                      </span>
                    )}
                    {touched.expiredDate &&
                      !errors.expiredDate &&
                      expiredDate && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* Upload Cover */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <label className="col-span-3 text-sm font-medium text-gray-700 pt-2">
                    Upload Certificate <span className="text-red-500">*</span>
                  </label>
                  <div className="col-span-7">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadCertificateChange}
                      onBlur={() => handleBlur("uploadCertificate")}
                      className={getInputClass(
                        "uploadCertificate",
                        "w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-30 transition-colors"
                      )}
                    />
                    {isEditMode &&
                      existingCertificate &&
                      !uploadCertificate && (
                        <p className="text-xs text-gray-600 mt-1">
                          Current:{" "}
                          <a
                            href={existingCertificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View existing certificate
                          </a>
                        </p>
                      )}
                    {uploadCertificate && (
                      <p className="text-xs text-gray-600 mt-1">
                        New file selected: {uploadCertificate.name}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center pt-2">
                    {touched.uploadCertificate && errors.uploadCertificate && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {errors.uploadCertificate}
                        </span>
                      </span>
                    )}

                    {touched.uploadCertificate &&
                      !errors.uploadCertificate &&
                      (uploadCertificate ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {uploadCertificate.name
                              ? `File: ${uploadCertificate.name}`
                              : "Valid"}
                          </span>
                        </span>
                      ) : isEditMode && existingCertificate ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Valid</span>
                        </span>
                      ) : null)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-6 px-6 py-4 border-t bg-gray-50 rounded-b-xl flex-shrink-0">
              <button
                onClick={handleSave}
                className="rounded-full bg-green-600 px-8 py-2 text-sm font-semibold text-white shadow hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="rounded-full bg-red-600 px-8 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
