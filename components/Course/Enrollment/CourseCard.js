import {
    ChevronDown,
    ChevronRight,
    Building2,
    Plus,
    Check,
    AlertCircle,
    Edit,
    Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import EnrollmentFormModal from "./EnrollmentForm";

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
    onRemove,
    onSave,
    onDeleteEnrollment
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
        const newEnrollmentIndex = enrollments.length;
        setPendingModalOpen(newEnrollmentIndex);
        onAddEnrollment(course.id_course); 
    };

    const handleSaveEnrollment = async (courseId, enrollmentIndex) => {
        const result = await onSave(courseId, enrollmentIndex);
        return result;
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                {/* Course Header */}
                <div
                    className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onToggleExpand(course.id_course)}
                >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Order Number Badge */}
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

                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h4 className="text-lg font-bold text-gray-900 line-clamp-1">
                                    {course.course_title}
                                </h4>
                            </div>

                            {/* Status Badges */}
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

                            {/* Enrolled Companies Preview */}
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

                    {/* Expand Button */}
                    <button 
                        type="button"
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all border-2 font-bold shadow-sm hover:shadow-md ${
                            enrollments.length > 0 
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
                                : 'Add Company'
                            }
                        </span>
                    </button>
                </div>

                {/* Expanded Section - Simple List */}
                {isExpanded && (
                    <div 
                        className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h5 className="text-base font-bold text-gray-900">
                                    Company Enrollments
                                </h5>
                                <p className="text-xs text-gray-600">
                                    Click enrollment to view or edit details
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddNew}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <Plus className="w-5 h-5" />
                                Add Company
                            </button>
                        </div>

                        {/* Enrollments List - Compact */}
                        <div className="space-y-3">
                            {enrollments.map((enrollment, idx) => {
                                const isExisting = !!enrollment.id_course_enrollment;
                                
                                return (
                                    <div
                                        key={enrollment.id_course_enrollment || enrollment.temp_id || idx}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                                            isExisting
                                                ? 'bg-white border-green-200 hover:border-green-300'
                                                : 'bg-yellow-50 border-yellow-300 hover:border-yellow-400'
                                        }`}
                                        onClick={() => openModal(enrollment, idx)}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                isExisting ? 'bg-green-100' : 'bg-yellow-100'
                                            }`}>
                                                <Building2 className={`w-5 h-5 ${
                                                    isExisting ? 'text-green-600' : 'text-yellow-600'
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900">
                                                    {enrollment.company_name || 'Incomplete'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
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
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openModal(enrollment, idx);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {!isExisting && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRemove(course.id_course, idx);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty State */}
                            {enrollments.length === 0 && (
                                <div className="p-12 bg-white border-2 border-dashed border-gray-300 rounded-2xl text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h4 className="text-base font-bold text-gray-900 mb-2">
                                        No Enrollments Yet
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Add companies to enroll in this course
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleAddNew}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-md hover:shadow-lg"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add First Company
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
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
                />
            )}
        </>
    );
}