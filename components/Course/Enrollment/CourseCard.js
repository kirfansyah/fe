import {
    ChevronDown,
    ChevronRight,
    Building2,
    Plus,
    Check,
    AlertCircle,
    Edit,
    Trash2,
    Lock,
    Eye,
    Globe,
    EyeOff,
    Clock,
    XCircle,
    Calendar as CalendarIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import EnrollmentFormModal from "./EnrollmentForm";
import Swal from 'sweetalert2';
import { getDeviceInfo } from '@/lib/deviceHelper';
export default function CourseCard({
    course,
    index,
    isExpanded,
    onToggleExpand,
    onAddEnrollment,
    companyUnits,
    groupEnroll,
    availableCompanies,
    onUpdateField,
    onToggleGroup,
    onDuplicate,
    onSave,
    onDeleteEnrollment,
    onUpdateEnrollmentStatus,
    permissions,
    created_by,
    onSuccess
}) {
    const [modalState, setModalState] = useState({
        isOpen: false,
        enrollmentIndex: null
    });

    const enrollments = course.enrollments || [];
    const existingEnrollments = enrollments.filter(e => e.id_course_enrollment);
    const newEnrollments = enrollments.filter(e => e.is_new);
    const totalCompaniesEnrolled = existingEnrollments.length;
    const [pendingModalOpen, setPendingModalOpen] = useState(null);

    const openModal = (enrollment, index) => {
        setModalState({
            isOpen: true,
            enrollment,
            enrollmentIndex: index
        });
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            enrollment: null,
            enrollmentIndex: null
        });
    };

    useEffect(() => {
        if (pendingModalOpen !== null && enrollments.length > pendingModalOpen) {
            const newEnrollment = enrollments[pendingModalOpen];
            openModal(newEnrollment, pendingModalOpen);
            setPendingModalOpen(null);
        }
    }, [enrollments.length]);

    const handleAddNew = () => {
        if (!permissions?.can_create) {
            Swal.fire({
                icon: 'error',
                title: 'Permission Denied',
                text: 'You do not have permission to add enrollments',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        const newEnrollmentIndex = enrollments.length;
        setPendingModalOpen(newEnrollmentIndex);
        onAddEnrollment(course.id_course);
    };

    const handleSaveEnrollment = async (courseId, enrollmentIndex) => {
        const result = await onSave(courseId, enrollmentIndex);
        return result;
    };

    // ✅ NEW: Handler untuk toggle enrollment status
    const handleToggleEnrollmentStatus = async (enrollment, idx) => {
        // Check permission
        if (!permissions?.can_edit) {
            await Swal.fire({
                icon: 'error',
                title: 'Permission Denied',
                text: 'You do not have permission to update enrollment status',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        const newStatus = !enrollment.is_active;
        
        const result = await Swal.fire({
            title: `${newStatus ? 'Activate' : 'inactivate'} Enrollment?`,
            html: `
                <p class="text-gray-700 mb-2">Are you sure you want to ${newStatus ? 'activate' : 'inactivate'} this enrollment?</p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p class="font-semibold text-gray-900">${enrollment.company_name || 'Incomplete'}</p>
                    <p class="text-sm text-gray-600 mt-1">
                        ${newStatus ? '✓ Students will be able to access this course' : '✗ Students will lose access to this course'}
                    </p>
                </div>
            `,
            icon: 'question',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: `Yes, ${newStatus ? 'Activate' : 'inactivate'}`,
            cancelButtonText: "Cancel",
            confirmButtonColor: newStatus ? "#059669" : "#dc2626",
            cancelButtonColor: "#1e3a8a",
            customClass: {
                cancelButton: "swal-cancel-style",
                confirmButton: "swal-confirm-style",
            }
        });
        
        if (!result.isConfirmed) return;

        const deviceInfo = getDeviceInfo();
            
        // ✅ Payload sesuai backend
        const payload = {
            is_active: newStatus,
            updated_by: created_by || 'System',
            updated_device: deviceInfo.device || 'Web'
        };
        
        // Trigger save
        const saveResult = await onUpdateEnrollmentStatus(
            enrollment.id_course_enrollment, 
                payload
        );
        
        if (saveResult.success) {
            await onSuccess();
            await Swal.fire({
                icon: 'success',
                toast: true,
                position: 'top-end',
                title: `Enrollment ${newStatus ? 'Activated' : 'inactivated'}!`,
                text: saveResult.message,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
        } else {
            await Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: saveResult.message,
                confirmButtonColor: '#1e3a8a'
            });
        }
    };

    const handleDelete = async (enrollment, idx) => {
        const isExisting = !!enrollment.id_course_enrollment;
        if (isExisting && !permissions?.can_delete) {
            await Swal.fire({
                icon: 'error',
                title: 'Permission Denied',
                text: 'You do not have permission to delete enrollments',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Delete Enrollment?',
            html: `
                <p class="text-gray-700 mb-2">Are you sure you want to delete this enrollment?</p>
                <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                    <p class="font-semibold text-gray-900">${enrollment.company_name || 'Incomplete'}</p>
                    <p class="text-sm text-gray-600 mt-1">
                        ${isExisting ? '⚠️ This will permanently delete the enrollment' : 'This will remove the pending enrollment'}
                    </p>
                </div>
            `,
            icon: 'warning',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#941d05",
            cancelButtonColor: "#1e3a8a",
            customClass: {
                cancelButton: "swal-cancel-style",
                confirmButton: "swal-confirm-style",
            }
        });

        if (!result.isConfirmed) return;

        const deleteResult = await onDeleteEnrollment(
            course.id_course,
            enrollment.id_course_enrollment,
            idx
        );

        if (deleteResult.success) {
            await Swal.fire({
                icon: 'success',
                toast: true,
                position: 'top-end',
                title: isExisting ? 'Deleted!' : 'Removed!',
                text: deleteResult.message,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
        } else {
            await Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: deleteResult.message,
                confirmButtonColor: '#1e3a8a'
            });
        }
    };

    const handleViewClick = (enrollment, idx) => {
        openModal(enrollment, idx);
    };

    const handleEditClick = (enrollment, idx, e) => {
        e?.stopPropagation();

        const isExisting = !!enrollment.id_course_enrollment;

        if (isExisting && !permissions?.can_edit) {
            Swal.fire({
                icon: 'error',
                title: 'Permission Denied',
                text: 'You do not have permission to edit enrollments',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        if (!isExisting && !permissions?.can_create) {
            Swal.fire({
                icon: 'error',
                title: 'Permission Denied',
                text: 'You do not have permission to modify pending enrollments',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        openModal(enrollment, idx);
    };

    // ✅ Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    };
    const getEnrollmentStatus = (enrollment) => {
        // ✅ Unpublished (dari backend)
        if (enrollment.is_unpublish) {
            return { 
                status: 'unpublished', 
                label: 'Unpublished', 
                color: 'red',
                icon: EyeOff 
            };
        }

        // ✅ Published (dari backend)
        if (enrollment.publish_date && enrollment.end_date) {
            return { 
                status: 'published', 
                label: 'Published', 
                color: 'green',
                icon: Globe 
            };
        }

        // ✅ Draft (belum ada tanggal)
        return { 
            status: 'draft', 
            label: 'Draft', 
            color: 'gray',
            icon: AlertCircle 
        };
    };

    const canInteract = permissions?.can_create || permissions?.can_edit || permissions?.can_delete;

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                {/* Course Header */}
                <div
                    className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onToggleExpand(course.id_course)}
                >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-lg font-bold text-white">{index + 1}</span>
                            </div>
                            {newEnrollments.length > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                                    <span className="text-xs font-bold text-white">{newEnrollments.length}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h4 className="text-lg font-bold text-gray-900 line-clamp-1">
                                    {course.course_title}
                                </h4>

                                {!canInteract && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        View Only
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {existingEnrollments.length > 0 && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                                        <Check className="w-3.5 h-3.5" />
                                        {existingEnrollments.length} Active
                                    </span>
                                )}

                                {newEnrollments.length > 0 && (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm animate-pulse">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {newEnrollments.length} Pending
                                    </span>
                                )}

                                {totalCompaniesEnrolled > 0 && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5" />
                                        {totalCompaniesEnrolled} {totalCompaniesEnrolled === 1 ? 'Company' : 'Companies'}
                                    </span>
                                )}
                            </div>

                            {existingEnrollments.length > 0 && (
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                    {existingEnrollments.slice(0, 3).map(enrollment => (
                                        <span
                                            key={enrollment.id_course_enrollment}
                                            className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-gray-200"
                                        >
                                            <Building2 className="w-3 h-3" />
                                            {enrollment.company_name}
                                        </span>
                                    ))}
                                    {existingEnrollments.length > 3 && (
                                        <span className="text-xs text-gray-500 font-semibold bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                                            +{existingEnrollments.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all border-2 font-bold shadow-sm hover:shadow-md ${enrollments.length > 0
                                ? 'text-green-700 bg-green-50 border-green-300 hover:bg-green-100'
                                : 'text-blue-700 bg-blue-50 border-blue-300 hover:bg-blue-100'
                            }`}
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                        ) : (
                            <ChevronRight className="w-5 h-5" />
                        )}
                        <span className="text-sm">
                            {enrollments.length > 0
                                ? `View (${enrollments.length})`
                                : canInteract ? 'Add Company' : 'View Details'
                            }
                        </span>
                    </button>
                </div>

                {/* Expanded Section */}
                {isExpanded && (
                    <div
                        className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h5 className="text-base font-bold text-gray-900">
                                    Company Enrollments
                                </h5>
                                <p className="text-xs text-gray-600">
                                    {canInteract
                                        ? 'Click enrollment to view or edit details'
                                        : 'View-only mode - you cannot make changes'
                                    }
                                </p>
                            </div>

                            {permissions?.can_create && (
                                <button
                                    type="button"
                                    onClick={handleAddNew}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Company
                                </button>
                            )}
                        </div>

                        {/* ✅ Updated Enrollments List with Smart Status */}
                        <div className="space-y-3">
                            {enrollments.map((enrollment, idx) => {
                                const isExisting = !!enrollment.id_course_enrollment;
                                const canEdit = isExisting ? permissions?.can_edit : permissions?.can_create;
                                const enrollStatus = getEnrollmentStatus(enrollment);
                                const StatusIcon = enrollStatus.icon;

                                // Color mapping for status
                                const statusColorMap = {
                                    'published': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
                                    'unpublished': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
                                    'draft': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
                                    'inactive': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
                                };

                                const statusColors = statusColorMap[enrollStatus.status] || statusColorMap.draft;

                                return (
                                    <div
                                        key={enrollment.id_course_enrollment || enrollment.temp_id || idx}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isExisting
                                                ? 'bg-white border-green-200'
                                                : 'bg-yellow-50 border-yellow-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isExisting ? 'bg-green-100' : 'bg-yellow-100'
                                                }`}>
                                                <Building2 className={`w-5 h-5 ${isExisting ? 'text-green-600' : 'text-yellow-600'
                                                    }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900">
                                                    {enrollment.company_name || 'Incomplete'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    {isExisting ? (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                            <Check className="w-3 h-3" />
                                                            Saved
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Pending
                                                        </span>
                                                    )}

                                                    {/* ✅ Smart Status Badge */}
                                                    {isExisting && StatusIcon && (
                                                        <span className={`px-2 py-0.5 ${statusColors.bg} ${statusColors.text} text-xs font-bold rounded-full flex items-center gap-1`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {enrollStatus.label}
                                                        </span>
                                                    )}

                                                    {enrollment.enroll_type_name && (
                                                        <span className="text-xs text-gray-600">
                                                            • {enrollment.enroll_type_name}
                                                        </span>
                                                    )}
                                                    {enrollment.course_status_name && (
                                                        <span className="text-xs text-gray-600">
                                                            • {enrollment.course_status_name}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* ✅ Show Date Range */}
                                                {isExisting && (enrollment.publish_date || enrollment.end_date) && (
                                                    <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
                                                        {enrollment.publish_date && (
                                                            <span className="flex items-center gap-1">
                                                                <CalendarIcon className="w-3 h-3" />
                                                                Start: {formatDate(enrollment.publish_date)}
                                                            </span>
                                                        )}
                                                        {enrollment.end_date && (
                                                            <span className="flex items-center gap-1">
                                                                <CalendarIcon className="w-3 h-3" />
                                                                End: {formatDate(enrollment.end_date)}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isExisting && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewClick(enrollment, idx);
                                                    }}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            )}

                                            {/* ✅ NEW: Toggle Active/Inactive Button */}
                                            {isExisting && permissions?.can_edit && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleEnrollmentStatus(enrollment, idx);
                                                    }}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                                                        ${
                                                        enrollment.is_active
                                                            ? 'text-green-600 bg-green-50'
                                                            : 'text-red-600 bg-gray-100'
                                                    }`}
                                                    title={`Click to ${enrollment.is_active ? 'inactivate' : 'activate'}`}
                                                >
                                                     <span>{enrollment.is_active ? 'Active' : 'Inactive'}</span>
                                                </button>
                                            )}

                                            {canEdit ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleEditClick(enrollment, idx, e)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            ) : !isExisting ? (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="p-2 text-gray-400 cursor-not-allowed rounded-lg"
                                                    title="No edit permission"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                </button>
                                            ) : null}

                                            {!isExisting || permissions?.can_delete ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(enrollment, idx);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title={isExisting ? 'Delete Enrollment' : 'Remove Pending'}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="p-2 text-gray-400 cursor-not-allowed rounded-lg"
                                                    title="No delete permission"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {enrollments.length === 0 && (
                                <div className="p-12 bg-white border-2 border-dashed border-gray-300 rounded-2xl text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h4 className="text-base font-bold text-gray-900 mb-2">
                                        No Enrollments Yet
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {permissions?.can_create
                                            ? 'Add companies to enroll in this course'
                                            : 'No companies enrolled in this course yet'
                                        }
                                    </p>

                                    {permissions?.can_create && (
                                        <button
                                            type="button"
                                            onClick={handleAddNew}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-md hover:shadow-lg"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Add First Company
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {modalState.isOpen && modalState.enrollment && (
                <EnrollmentFormModal
                    isOpen={modalState.isOpen}
                    onClose={closeModal}
                    courseId={course.id_course}
                    courseName={course.course_title}
                    enrollment={modalState.enrollment}
                    enrollmentIndex={modalState.enrollmentIndex}
                    companyUnits={companyUnits}
                    groupEnroll={groupEnroll}
                    availableCompanies={availableCompanies(course.id_course, modalState.enrollmentIndex)}
                    onUpdateField={onUpdateField}
                    onToggleGroup={onToggleGroup}
                    onSave={handleSaveEnrollment}
                    permissions={permissions}
                />
            )}
        </>
    );
}