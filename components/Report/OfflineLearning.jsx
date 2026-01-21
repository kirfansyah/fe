import { useState, useEffect, useContext } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  X,
  Calendar,
  CirclePlus,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Users,
  GraduationCap
} from "lucide-react";
import ExcelJS from "exceljs";
import { useDebounce } from "@/hooks/useDebounce";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { ReportTableSkeleton } from "@/components/Loading/Skeleton";
import { getDeviceInfo } from '@/lib/deviceHelper';
import { ProfileContext } from '@/contexts/profile/ProfileContext';
import API from '../../services/api';

export default function OfflineLearningView({
  offlineLearning = [],
  pagination,
  loading,
  error,
  onSave,
  onUpdate,
  onDelete,
  onFetch,
  position,
  dept,
  company,
  fetchEmployee
}) {
  const { showWarning, showSuccess, showError, confirmAction } = useSweetAlert();
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Filters - Sekarang kirim ID
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedTraining, setSelectedTraining] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ✅ Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCertificateId, setCurrentCertificateId] = useState(null);
  
  // ✅ Form states
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

  // ✅ State untuk master data filters
  const [filterOptions, setFilterOptions] = useState({
    companies: [],    // [{id: 1, name: "PT ABC"}]
    departments: [],  // [{id: 2, name: "IT"}]
    trainings: [],    // [Training titles as strings]
    providers: []     // [Provider names as strings]
  });

  // ✅ Fetch master data untuk filters saat component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await API.get('/report/offline-learning', { 
          params: { page: 1, limit: 99999 } 
        });
        
        const data = response.data.data || [];
        
        // Build unique lists
        const uniqueCompanies = [];
        const uniqueDepartments = [];
        const uniqueTrainings = new Set();
        const uniqueProviders = new Set();
        
        const companySet = new Set();
        const deptSet = new Set();
        
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
          
          // Trainings (tetap string karena backend filter by name)
          if (item.training_title) {
            uniqueTrainings.add(item.training_title);
          }
          
          // Providers (tetap string)
          if (item.issuing_organization) {
            uniqueProviders.add(item.issuing_organization);
          }
        });
        
        // Sort
        uniqueCompanies.sort((a, b) => a.name.localeCompare(b.name));
        uniqueDepartments.sort((a, b) => a.name.localeCompare(b.name));
        
        setFilterOptions({
          companies: uniqueCompanies,
          departments: uniqueDepartments,
          trainings: Array.from(uniqueTrainings).sort(),
          providers: Array.from(uniqueProviders).sort()
        });
        
      } catch (error) {
        console.error("Error fetching filter options:", error);
        setFilterOptions({
          companies: [],
          departments: [],
          trainings: [],
          providers: []
        });
      }
    };
    
    fetchFilterOptions();
  }, []);

  const { dataKaryawan } = useContext(ProfileContext);

  // ✅ Fetch data with server-side filters (kirim IDs untuk company & dept)
  useEffect(() => {
    const filters = {
      search: debouncedSearch,
      company_id: selectedCompanyId,        // ✅ Kirim ID
      department_id: selectedDeptId,        // ✅ Kirim ID
      training_title: selectedTraining,      // ✅ String (backend filter by name)
      issuing_organization: selectedProvider, // ✅ String (backend filter by name)
      start_date: dateFrom,
      end_date: dateTo
    };
    
    onFetch(currentPage, pageSize, filters);
  }, [currentPage, pageSize, debouncedSearch, selectedCompanyId, selectedDeptId, selectedTraining, selectedProvider, dateFrom, dateTo]);

  // ✅ Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCompanyId, selectedDeptId, selectedTraining, selectedProvider, dateFrom, dateTo]);

  // ✅ Auto-fetch employee data
  const [isFetchingEmployee, setIsFetchingEmployee] = useState(false);

  // ✅ Update useEffect untuk employee fetch
  useEffect(() => {
    if (!employeeComp || employeeId.length < 5) {
      setIsFetchingEmployee(false);
      return;
    }

    setIsFetchingEmployee(true); // ✅ Start loading

    const timer = setTimeout(async () => {
      try {
        const res = await fetchEmployee(employeeComp, employeeId);

        if (res?.success && res.data) {
          setemployeeName(res.data.nama || "");
          setemployeePosition(res.data.position_name || "");
          setemployeeDept(res.data.department_id || "");
        }
      } catch (err) {
        console.warn("Employee not found");
      } finally {
        setIsFetchingEmployee(false); // ✅ Stop loading
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      setIsFetchingEmployee(false); // ✅ Cleanup
    };
  }, [employeeComp, employeeId, fetchEmployee]);

   const clearAllFilters = () => {
    setSelectedCompanyId("");
    setSelectedDeptId("");
    setSelectedTraining("");
    setSelectedProvider("");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
  };

  const activeFiltersCount = [
    selectedCompanyId,
    selectedDeptId,
    selectedTraining,
    selectedProvider,
    dateFrom,
    dateTo
  ].filter(Boolean).length;

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

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(offlineLearning.map((item) => item.id_training_certificate));
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

  const handleDelete = async (id) => {
    const deviceInfo = getDeviceInfo();
    const result = await confirmAction({
      title: 'Delete Certificate?',
      html: 'This action cannot be undone. Are you sure you want to delete this certificate?',
      confirmButtonText: 'Yes, delete!',
      icon: 'warning'
    });

    if (result.isConfirmed) {
      try {
        const payload = {
          id_training_certificate: id,
          updated_by: deviceInfo.device,
          updated_device: "Web"
        };
        await onDelete(payload);
        showSuccess('Certificate deleted successfully');
      } catch (error) {
        showError('Failed to delete certificate: ' + error.message);
      }
    }
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCurrentCertificateId(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setIsEditMode(true);
    setCurrentCertificateId(item.id_training_certificate);

    setemployeeId(item.employee_id || "");
    setemployeeName(item.full_name || "");
    setemployeePosition(item.position_id?.toString() || "");
    setemployeeDept(item.department_id?.toString() || "");
    setemployeeComp(item.company_id?.toString() || "");
    settrainingTitle(item.training_title || "");
    setprovider(item.issuing_organization || "");
    setcertificateId(item.credential_id || "");
    setcertificateUrl(item.credential_url || "");
    setissueDate(item.issue_date || "");
    setexpiredDate(item.expiration_date || "");
    setExistingCertificate(item.certificate_url || "");
    setuploadCertificate(null);
    setIsModalOpen(true);
  };

  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "employeeId":
        if (!value || value.trim() === "") error = "Employee ID is required";
        break;
      case "employeeName":
        if (!value || value.trim() === "") error = "Employee name is required";
        break;
      case "employeePosition":
        if (!value) error = "Employee position is required";
        break;
      case "employeeDept":
        if (!value) error = "Employee department is required";
        break;
      case "employeeComp":
        if (!value) error = "Company is required";
        break;
      case "trainingTitle":
        if (!value || value.trim() === "") error = "Training title is required";
        break;
      case "provider":
        if (!value || value.trim() === "") error = "Provider is required";
        break;
      case "certificateUrl":
        if (!value || value.trim() === "") error = "Credential URL is required";
        break;
      case "certificateId":
        if (!value || value.trim() === "") error = "Credential ID is required";
        break;
      case "issueDate":
        if (!value) error = "Issue date is required";
        break;
      case "expiredDate":
        if (!value) error = "Expired date is required";
        break;
      case "uploadCertificate":
        if (!isEditMode && !value) error = "Certificate file is required";
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
      case "employeeId": value = employeeId; break;
      case "employeeName": value = employeeName; break;
      case "employeePosition": value = employeePosition; break;
      case "employeeDept": value = employeeDept; break;
      case "employeeComp": value = employeeComp; break;
      case "trainingTitle": value = trainingTitle; break;
      case "provider": value = provider; break;
      case "certificateId": value = certificateId; break;
      case "certificateUrl": value = certificateUrl; break;
      case "issueDate": value = issueDate; break;
      case "expiredDate": value = expiredDate; break;
      case "uploadCertificate": value = uploadCertificate; break;
      default: break;
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

    if (touched.uploadCertificate) {
      const error = validateField("uploadCertificate", file);
      setErrors((prev) => ({ ...prev, uploadCertificate: error }));
    }
  };

  const validateAll = () => {
    const employeeIdError = validateField("employeeId", employeeId);
    const employeeNameError = validateField("employeeName", employeeName);
    const employeePositionError = validateField("employeePosition", employeePosition);
    const employeeDeptError = validateField("employeeDept", employeeDept);
    const employeeCompError = validateField("employeeComp", employeeComp);
    const trainingTitleError = validateField("trainingTitle", trainingTitle);
    const providerError = validateField("provider", provider);
    const certificateIdError = validateField("certificateId", certificateId);
    const certificateUrlError = validateField("certificateUrl", certificateUrl);
    const issueDateError = validateField("issueDate", issueDate);
    const expiredDateError = validateField("expiredDate", expiredDate);
    const uploadCertificateError = validateField("uploadCertificate", uploadCertificate);

    setErrors({
      employeeId: employeeIdError,
      employeeName: employeeNameError,
      employeePosition: employeePositionError,
      employeeDept: employeeDeptError,
      employeeComp: employeeCompError,
      trainingTitle: trainingTitleError,
      provider: providerError,
      certificateId: certificateIdError,
      certificateUrl: certificateUrlError,
      issueDate: issueDateError,
      expiredDate: expiredDateError,
      uploadCertificate: uploadCertificateError,
    });

    setTouched({
      employeeId: true,
      employeeName: true,
      employeePosition: true,
      employeeDept: true,
      employeeComp: true,
      trainingTitle: true,
      provider: true,
      certificateId: true,
      certificateUrl: true,
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
      !certificateUrlError &&
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
      showWarning('Please fill in all required fields correctly');
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
      created_by: "Admin",
      created_device: "Web",
      updated_by: "Admin",
      updated_device: "Web"
    };

    try {
      if (isEditMode) {
        await onUpdate(currentCertificateId, offlineLearningData);
      } else {
        await onSave(offlineLearningData);
      }
      handleCancel();
    } catch (error) {
      console.error("Error saving certificate:", error);
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

  const handleExportExcel = async () => {
    if (selectedItems.length === 0) {
      showWarning("Please select at least one record to export");
      return;
    }

    try {
      const selectedData = offlineLearning.filter((item) =>
        selectedItems.includes(item.id_training_certificate)
      );

      if (!selectedData.length) {
        showWarning("Selected data not found");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Offline Learning Report", {
        views: [{ state: "frozen", ySplit: 1 }],
      });

      worksheet.columns = [
        { header: "No", key: "no", width: 6 },
        { header: "Company Unit", key: "company", width: 28 },
        { header: "Department", key: "dept", width: 12 },
        { header: "Employee ID", key: "empId", width: 14 },
        { header: "Employee Name", key: "name", width: 28 },
        { header: "Position", key: "position", width: 18 },
        { header: "Training Title", key: "training", width: 35 },
        { header: "Provider", key: "provider", width: 25 },
        { header: "Credential ID", key: "credentialId", width: 22 },
        { header: "Credential URL", key: "credentialUrl", width: 35 },
        { header: "Issue Date", key: "issueDate", width: 14 },
        { header: "Expiration Date", key: "expDate", width: 14 },
        { header: "Certificate URL", key: "certificateUrl", width: 40 },
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
        worksheet.addRow({
          no: index + 1,
          company: item.company_name || "-",
          dept: item.dept_abbr || "-",
          empId: item.employee_id || "-",
          name: item.full_name || "-",
          position: item.position_name || "-",
          training: item.training_title || "-",
          provider: item.issuing_organization || "-",
          credentialId: item.credential_id || "-",
          credentialUrl: item.credential_url || "-",
          issueDate: item.issue_date ? new Date(item.issue_date) : "-",
          expDate: item.expiration_date ? new Date(item.expiration_date) : "-",
          certificateUrl: item.certificate_url || "-",
        });
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

          if ([1, 3, 4, 11, 12].includes(colNumber)) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
          }
        });

        const certCell = row.getCell("certificateUrl");
        if (certCell.value && certCell.value !== "-") {
          certCell.value = {
            text: "View Certificate",
            hyperlink: certCell.value,
          };
          certCell.font = { color: { argb: "FF0000FF" }, underline: true };
        }
      });

      worksheet.getColumn("issueDate").numFmt = "dd-mm-yyyy";
      worksheet.getColumn("expDate").numFmt = "dd-mm-yyyy";

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

      a.download = `Offline_Learning_Report_${dateStr}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      showSuccess(`Successfully exported ${selectedData.length} records to Excel`);
      setSelectedItems([]);
    } catch (error) {
      console.error("Export error:", error);
      showError("Failed to export to Excel. Please try again.");
    }
  };

  // ✅ Loading State
  if (loading) {
    return <ReportTableSkeleton />;
  }

  // // ✅ Error State
  // if (error) {
  //   return (
  //     <div className="text-center py-12">
  //       <div className="text-red-600 mb-4">{error}</div>
  //       <button
  //         onClick={() => onFetch(1, 10)}
  //         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  //       >
  //         Retry
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full mx-auto bg-white rounded-lg">
      {/* Header with Search and Actions */}
      <div className="mb-6 space-y-4">
        {/* Top Row: Add Button + Search + Export */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <CirclePlus size={18} />
            Add Certificate
          </button>

          <button
            onClick={handleExportExcel}
            disabled={selectedItems.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
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

        {/* ✅ Filters Row - Pakai filterOptions dengan ID untuk company & dept */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search name, employee ID, training..."
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

          {/* Company Select */}
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

          {/* Department Select */}
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

          {/* Training Select */}
          {/* <select
            value={selectedTraining}
            onChange={(e) => setSelectedTraining(e.target.value)}
            className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Trainings</option>
            {filterOptions.trainings.map((training) => (
              <option key={training} value={training}>{training}</option>
            ))}
          </select> */}

          {/* Provider Select */}
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Providers</option>
            {filterOptions.providers.map((provider) => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>

          {/* Date Range Picker */}
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

      {/* ✅ Active Filters Badges - Display names */}
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
          {selectedTraining && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Training: {selectedTraining}
              <button onClick={() => setSelectedTraining("")} className="hover:text-purple-900">
                <X size={14} />
              </button>
            </span>
          )}
          {selectedProvider && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              Provider: {selectedProvider}
              <button onClick={() => setSelectedProvider("")} className="hover:text-orange-900">
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

      {/* Table with Checkbox */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1600px] w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr className="border-b border-gray-200">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === offlineLearning.length && offlineLearning.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Position</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Training Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Credential ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Issue Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Expiration</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Certificate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {offlineLearning.length > 0 ? (
                offlineLearning.map((item, index) => (
                  <tr
                    key={item.id_training_certificate}
                    className={`hover:bg-blue-50 transition-colors ${
                      selectedItems.includes(item.id_training_certificate) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id_training_certificate)}
                        onChange={(e) => handleSelectItem(item.id_training_certificate, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_training_certificate)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-gray-900">{item.full_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{item.employee_id}</div>
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
                      <div className="text-sm font-medium text-gray-900 max-w-[250px] truncate" title={item.training_title}>
                        {item.training_title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{item.issuing_organization}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{item.credential_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {item.issue_date ? new Date(item.issue_date).toLocaleDateString("id-ID") : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {item.expiration_date ? new Date(item.expiration_date).toLocaleDateString("id-ID") : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.certificate_url ? (
                        <a
                          href={item.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          📥 View
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No file</span>
                      )}
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
                        {activeFiltersCount > 0 || searchQuery ? "No results found" : "No offline learning data"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {activeFiltersCount > 0 || searchQuery 
                          ? "Try adjusting your filters or search query"
                          : "Click 'Add Certificate' to get started"
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

      {isModalOpen && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    onClick={handleCancel}
  >
    <div
      className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ✅ Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
        <div className="flex items-center gap-3">
          {isEditMode ? (
            <Edit className="w-6 h-6 text-blue-600" />
          ) : (
            <CirclePlus className="w-6 h-6 text-green-600" />
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isEditMode ? "Edit Training Certificate" : "Add New Training Certificate"}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {isEditMode ? "Update certificate information" : "Fill in the form below to add a new certificate"}
            </p>
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* ✅ Body - Scrollable */}
      <div className="overflow-y-auto px-6 py-6 flex-1">
        <div className="space-y-6">
          {/* ✅ Section 1: Employee Lookup */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              Employee Lookup
              <span className="text-xs font-normal text-gray-500">(Enter Company & NIK to auto-fill employee data)</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={employeeComp}
                  onChange={handleEmployeeCompChange}
                  onBlur={() => handleBlur("employeeComp")}
                  disabled={isEditMode}
                  className={getInputClass(
                    "employeeComp",
                    "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  )}
                >
                  <option value="">Select Company...</option>
                  {company?.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.company_name}
                    </option>
                  ))}
                </select>
                {touched.employeeComp && errors.employeeComp && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.employeeComp}
                  </p>
                )}
              </div>

              {/* NIK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIK (Employee ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={handleEmployeeIdChange}
                  onBlur={() => handleBlur("employeeId")}
                  disabled={isEditMode}
                  placeholder="Enter NIK"
                  className={getInputClass(
                    "employeeId",
                    "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  )}
                />
                {touched.employeeId && errors.employeeId && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.employeeId}
                  </p>
                )}
                {/* ✅ Loading indicator - hanya tampil saat fetching */}
                {!isEditMode && isFetchingEmployee && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    Fetching employee data...
                  </p>
                )}
                
                {/* ✅ Success indicator - tampil setelah berhasil fetch */}
                {!isEditMode && !isFetchingEmployee && employeeName && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Employee found!
                  </p>
                )}
                
                {/* ✅ Error indicator - tampil jika tidak ditemukan */}
                {!isEditMode && !isFetchingEmployee && !employeeName && employeeId.length >= 5 && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Employee not found
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Section 2: Employee Information (Read-only) */}
          {employeeName && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                Employee Information
                <span className="text-xs font-normal text-green-600">(Auto-filled)</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={employeeName}
                    readOnly
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-gray-50 cursor-not-allowed"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    value={employeePosition}
                    readOnly
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-gray-50 cursor-not-allowed"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={dept?.find(d => d.id === parseInt(employeeDept))?.dept_abbr || employeeDept}
                    readOnly
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-gray-50 cursor-not-allowed"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={company?.find(c => c.id === parseInt(employeeComp))?.company_name || ''}
                    readOnly
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ✅ Section 3: Training Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <GraduationCap size={16} className="text-green-600" />
              Training & Certificate Details
            </h4>
            
            <div className="space-y-4">
              {/* Training Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={trainingTitle}
                  onChange={handleTrainingTitleChange}
                  onBlur={() => handleBlur("trainingTitle")}
                  placeholder="e.g., ISO 9001:2015 Internal Auditor"
                  className={getInputClass(
                    "trainingTitle",
                    "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  )}
                />
                {touched.trainingTitle && errors.trainingTitle && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.trainingTitle}
                  </p>
                )}
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuing Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={provider}
                  onChange={handleProviderChange}
                  onBlur={() => handleBlur("provider")}
                  placeholder="e.g., BSI Group, TÜV SÜD, SAI Global"
                  className={getInputClass(
                    "provider",
                    "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  )}
                />
                {touched.provider && errors.provider && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.provider}
                  </p>
                )}
              </div>

              {/* Credential ID & URL - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Credential ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credential ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={certificateId}
                    onChange={handleCertificateIdChange}
                    onBlur={() => handleBlur("certificateId")}
                    placeholder="e.g., CERT-2024-12345"
                    className={getInputClass(
                      "certificateId",
                      "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    )}
                  />
                  {touched.certificateId && errors.certificateId && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.certificateId}
                    </p>
                  )}
                </div>

                {/* Credential URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credential URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={certificateUrl}
                    onChange={handleCertificateUrlChange}
                    onBlur={() => handleBlur("certificateUrl")}
                    placeholder="https://verify.example.com/cert/12345"
                    className={getInputClass(
                      "certificateUrl",
                      "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    )}
                  />
                  {touched.certificateUrl && errors.certificateUrl && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.certificateUrl}
                    </p>
                  )}
                </div>
              </div>

              {/* Issue Date & Expiration Date - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Issue Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="date"
                      value={issueDate}
                      onChange={handleIssueDateChange}
                      onBlur={() => handleBlur("issueDate")}
                      className={getInputClass(
                        "issueDate",
                        "w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      )}
                    />
                  </div>
                  {touched.issueDate && errors.issueDate && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.issueDate}
                    </p>
                  )}
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="date"
                      value={expiredDate}
                      onChange={handleExpiredDateChange}
                      onBlur={() => handleBlur("expiredDate")}
                      className={getInputClass(
                        "expiredDate",
                        "w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      )}
                    />
                  </div>
                  {touched.expiredDate && errors.expiredDate && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.expiredDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Upload Certificate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleUploadCertificateChange}
                    onBlur={() => handleBlur("uploadCertificate")}
                    className="hidden"
                    id="certificate-upload"
                  />
                  <label
                    htmlFor="certificate-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <FileSpreadsheet className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF only (Max 5MB)</p>
                  </label>
                </div>

                {/* File Info */}
                {uploadCertificate && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800 truncate flex-1">
                      {uploadCertificate.name}
                    </span>
                    <button
                      onClick={() => setuploadCertificate(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {isEditMode && existingCertificate && !uploadCertificate && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-blue-800 flex-1">Current certificate uploaded</span>
                    <a
                      href={existingCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                )}

                {touched.uploadCertificate && errors.uploadCertificate && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.uploadCertificate}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <button
          onClick={handleCancel}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!employeeName}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditMode ? (
            <>
              <Edit size={16} />
              Update Certificate
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Save Certificate
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}