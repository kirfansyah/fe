import { Settings, Loader2, AlertCircle, Shield } from "lucide-react";
import { useState, useMemo } from "react";
import React from "react";
import FilterSection from "./FilterSection";
import CourseCard from "./CourseCard";
import { useSweetAlert } from '../../../hooks/useSweetAlert';

const ENROLLMENT_TYPE_IDS = {
    GENERAL: 1,
    SPECIFIC: 2
};

const COURSE_STATUS_IDS = {
    MANDATORY: 1,
    OPTIONAL: 2
};

export default function ListCourses({ 
    enrollmentData = {},  
    groupEnroll = [],
    companyUnits = [],
    onCourseChange,
    deleteEnrolls,
    onDeleteContentSuccess,
    loading = false,
    error = null,
    permissions // ✅ Receive permissions
}) {
    const [expanded, setExpanded] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCompany, setFilterCompany] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    
    const { showSuccess, showError, showWarning, confirmAction, showLoading, closeLoading } = useSweetAlert();

    const courses = useMemo(() => {
        if (!enrollmentData || typeof enrollmentData !== 'object') {
            return [];
        }
        
        return Object.values(enrollmentData).map(data => ({
            id_course: data?.id_course,
            course_title: data?.course_title || '',
            course_description: data?.course_description || '',
            is_active: data?.is_active !== undefined ? data.is_active : true,
            enrollments: data?.enrollments || []
        })).filter(course => course.id_course);
    }, [enrollmentData]);

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            if (searchQuery && !course.course_title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            const hasEnrollments = course.enrollments && course.enrollments.length > 0;
            if (filterStatus === "enrolled" && !hasEnrollments) return false;
            if (filterStatus === "not-enrolled" && hasEnrollments) return false;

            if (filterCompany !== "all") {
                const hasCompany = course.enrollments?.some(e => 
                    e.company_id === parseInt(filterCompany)
                );
                if (!hasCompany) return false;
            }

            return true;
        });
    }, [courses, searchQuery, filterStatus, filterCompany]);

    const toggleExpand = (id) => {
        setExpanded(expanded === id ? null : id);
    };

    const addEnrollment = (courseId) => {
        // ✅ Check permission
        if (!permissions?.can_create) {
            showError('You do not have permission to add enrollments');
            return;
        }

        const currentData = enrollmentData[courseId];
        
        if (!currentData) {
            showError('Course not found. Please refresh the page.');
            return;
        }
        
        const usedCompanyIds = (currentData.enrollments || [])
            .map(e => e.company_id)
            .filter(id => id !== null);
        
        const availableCompanies = companyUnits.filter(c => !usedCompanyIds.includes(c.id));
        
        if (availableCompanies.length === 0) {
            showWarning('All companies have been enrolled for this course.');
            return;
        }
        
        const newEnrollment = {
            temp_id: `temp_${Date.now()}`,
            company_id: null,
            enroll_type_name: '',
            course_status_name: '',
            publish_date: '',
            end_date: '',
            remedial_allowed: 'Yes',
            remedial_limit: 1,
            passing_grade: 0,
            refreshment_months: null,
            groupings: [],
            is_new: true
        };

        const updatedEnrollments = [...(currentData.enrollments || []), newEnrollment];
        onCourseChange(courseId, 'enrollments', updatedEnrollments);
        
        setExpanded(courseId);
        showSuccess('New enrollment added. Please fill in the details.');
    };

    const handleDeleteEnrollment = async (courseId, enrollmentId, enrollmentIndex) => {
        const currentData = enrollmentData[courseId] || {};
        const enrollments = currentData.enrollments || [];
        const enrollment = enrollments[enrollmentIndex];
        
        if (!enrollment) {
            return { success: false, message: 'Enrollment not found.' };
        }

        const isExisting = !!enrollment.id_course_enrollment;

        if (isExisting && !permissions?.can_delete) {
            return { 
                success: false, 
                message: 'You do not have permission to delete enrollments' 
            };
        }

        if (isExisting) {
            showLoading('Deleting enrollment...');
            
            try {
                const deleteResult = await deleteEnrolls(enrollmentId);
                closeLoading();

                if (deleteResult.success) {
                    await onDeleteContentSuccess(); // Notify parent to refresh data
                    const updated = enrollments.filter((_, i) => i !== enrollmentIndex);
                    onCourseChange(courseId, 'enrollments', updated);
                    
                    return { 
                        success: true, 
                        message: deleteResult.message || 'Enrollment deleted successfully' 
                    };
                } else {
                    return { 
                        success: false, 
                        message: deleteResult.message || 'Failed to delete enrollment' 
                    };
                }
            } catch (error) {
                closeLoading();
                console.error('Delete enrollment error:', error);
                return { 
                    success: false, 
                    message: 'An error occurred while deleting enrollment' 
                };
            }
        } else {
            const updated = enrollments.filter((_, i) => i !== enrollmentIndex);
            onCourseChange(courseId, 'enrollments', updated);
            
            return { 
                success: true, 
                message: 'Pending enrollment removed successfully' 
            };
        }
    };

    const duplicateEnrollment = async (courseId, index) => {
        // ✅ Check permission
        if (!permissions?.can_create) {
            showError('You do not have permission to duplicate enrollments');
            return;
        }

        const currentData = enrollmentData[courseId] || {};
        const enrollments = currentData.enrollments || [];
        const toCopy = enrollments[index];
        
        if (!toCopy) {
            showError('Enrollment not found.');
            return;
        }
        
        const usedCompanyIds = enrollments.map(e => e.company_id).filter(id => id !== null);
        const availableCompanies = companyUnits.filter(c => !usedCompanyIds.includes(c.id));
        
        if (availableCompanies.length === 0) {
            showWarning('All companies have been enrolled. Cannot duplicate.');
            return;
        }
        
        const result = await confirmAction({
            title: 'Duplicate Enrollment?',
            text: 'Create a copy of this enrollment configuration?',
            confirmButtonText: 'Yes, duplicate it!'
        });
        
        if (!result.isConfirmed) return;
        
        const newEnrollment = {
            ...toCopy,
            temp_id: `temp_${Date.now()}`,
            company_id: null,
            company_name: null,
            id_course_enrollment: null,
            is_new: true
        };
        
        onCourseChange(courseId, 'enrollments', [...enrollments, newEnrollment]);
        showSuccess('Enrollment duplicated. Please select a company.');
    };

    const updateEnrollmentField = (courseId, enrollmentIndex, field, value) => {
        // ✅ Check permission for edit
        const currentData = enrollmentData[courseId] || {};
        const enrollments = [...(currentData.enrollments || [])];
        const enrollment = enrollments[enrollmentIndex];
        
        if (!enrollment) {
            showError('Enrollment not found.');
            return;
        }

        const isExisting = !!enrollment.id_course_enrollment;
        const isNew = enrollment.is_new;

        // ✅ Permission check based on enrollment state
        if (isExisting && !permissions?.can_edit) {
            showError('You do not have permission to edit existing enrollments');
            return;
        }

        if (isNew && !permissions?.can_create) {
            showError('You do not have permission to modify new enrollments');
            return;
        }
        
        if (isExisting) {
            if (field === 'enroll_type_name') {
                enrollment.enroll_type_name = value;
                enrollment.id_enrollment_type = value === 'General' 
                    ? ENROLLMENT_TYPE_IDS.GENERAL 
                    : ENROLLMENT_TYPE_IDS.SPECIFIC;
            } else if (field === 'course_status_name') {
                enrollment.course_status_name = value;
                enrollment.id_course_status = value === 'Mandatory' 
                    ? COURSE_STATUS_IDS.MANDATORY 
                    : COURSE_STATUS_IDS.OPTIONAL;
            } else if (field === 'remedial_allowed') {
                enrollment.remedial_allowed = value === 'Yes';
            } else {
                enrollment[field] = value;
            }
        } else {
            enrollment[field] = value;
        }
        
        enrollments[enrollmentIndex] = enrollment;
        
        if (field === 'enroll_type_name' && value === 'General') {
            enrollments[enrollmentIndex].groupings = [];
        }
        
        onCourseChange(courseId, 'enrollments', enrollments);
    };

    const extractGroupingIds = (groupings) => {
        if (!Array.isArray(groupings) || groupings.length === 0) {
            return [];
        }
        
        return groupings.map(item => {
            if (typeof item === 'number') {
                return item;
            }
            if (item && typeof item === 'object' && item.id_grouping !== undefined) {
                return parseInt(item.id_grouping);
            }
            if (typeof item === 'string') {
                const num = parseInt(item);
                return isNaN(num) ? null : num;
            }
            return null;
        }).filter(id => id !== null && !isNaN(id) && id > 0);
    };

    const toggleEnrollmentGroup = (courseId, enrollmentIndex, groupId) => {
        const currentData = enrollmentData[courseId] || {};
        const enrollments = currentData.enrollments || [];
        const enrollment = enrollments[enrollmentIndex];
        
        if (!enrollment) {
            showError('Enrollment not found.');
            return;
        }

        // ✅ Check permission
        const isExisting = !!enrollment.id_course_enrollment;
        if (isExisting && !permissions?.can_edit) {
            showError('You do not have permission to edit group selections');
            return;
        }
        if (!isExisting && !permissions?.can_create) {
            showError('You do not have permission to modify group selections');
            return;
        }
        
        const currentGroups = extractGroupingIds(enrollment.groupings);
        
        let newGroups;
        if (currentGroups.includes(groupId)) {
            newGroups = currentGroups.filter(id => id !== groupId);
        } else {
            newGroups = [...currentGroups, groupId];
        }
        
        updateEnrollmentField(courseId, enrollmentIndex, 'groupings', newGroups);
    };

    const getAvailableCompanies = (courseId, currentIndex) => {
        const currentData = enrollmentData[courseId] || {};
        const enrollments = currentData.enrollments || [];
        
        const usedCompanyIds = enrollments
            .map((e, i) => i !== currentIndex ? e.company_id : null)
            .filter(id => id !== null);
        
        return companyUnits.filter(company => !usedCompanyIds.includes(company.id));
    };

    const handleSaveEnrollment = async (courseId, enrollmentIndex) => {
        const currentData = enrollmentData[courseId] || {};
        const enrollments = currentData.enrollments || [];
        const enrollment = enrollments[enrollmentIndex];
        
        if (!enrollment) {
            await showError('Enrollment not found.');
            return { success: false };
        }

        // ✅ Check permission
        const isExisting = !!enrollment.id_course_enrollment;
        if (isExisting && !permissions?.can_edit) {
            await showError('You do not have permission to update enrollments');
            return { success: false };
        }
        if (!isExisting && !permissions?.can_create) {
            await showError('You do not have permission to create enrollments');
            return { success: false };
        }
        
        // Validation
        if (!enrollment.company_id) {
            await showWarning('Please select a company.');
            return { success: false };
        }
        
        if (!enrollment.enroll_type_name) {
            await showWarning('Please select enrollment type.');
            return { success: false };
        }
        
        if (!enrollment.course_status_name) {
            await showWarning('Please select course status.');
            return { success: false };
        }
        
        if (!enrollment.publish_date) {
            await showWarning('Please select start date.');
            return { success: false };
        }
        
        if (enrollment.passing_grade === undefined || enrollment.passing_grade === null) {
            await showWarning('Please enter minimum score.');
            return { success: false };
        }
        
        if (enrollment.passing_grade < 0 || enrollment.passing_grade > 100) {
            await showWarning('Minimum score must be between 0 and 100.');
            return { success: false };
        }
        
        if (enrollment.enroll_type_name === 'Specific' && 
            (!enrollment.groupings || enrollment.groupings.length === 0)) {
            await showWarning('Please select at least one group for specific enrollment.');
            return { success: false };
        }
        
        if (onCourseChange) {
            const result = await onCourseChange(courseId, 'save_single', {
                course: currentData,
                enrollment: enrollment,
                index: enrollmentIndex
            });
            
            return result || { success: false };
        }
        
        return { success: false };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading courses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-red-900 mb-2">Failed to Load Courses</h3>
                <p className="text-red-700 mb-4">{error.message || 'An unexpected error occurred'}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all"
                >
                    Reload Page
                </button>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Available</h3>
                <p className="text-gray-600 mb-6">
                    There are no courses in the system yet.
                </p>
                {permissions?.can_create && (
                    <button
                        onClick={() => window.location.href = '/course/add'}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                        Create First Course
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* ✅ Read-Only Notice for no permissions */}
            {!permissions?.can_create && !permissions?.can_edit && !permissions?.can_delete && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-semibold text-blue-900">View-Only Mode</h4>
                            <p className="text-sm text-blue-700">
                                You can view course enrollments but cannot make changes.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <FilterSection
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterCompany={filterCompany}
                setFilterCompany={setFilterCompany}
                companyUnits={companyUnits}
                filteredCount={filteredCourses.length}
                totalCount={courses.length}
            />

            <div className="space-y-3">
                {filteredCourses.map((course, index) => (
                    <CourseCard
                        key={course.id_course}
                        course={course}
                        index={index}
                        isExpanded={expanded === course.id_course}
                        onToggleExpand={toggleExpand}
                        onAddEnrollment={addEnrollment}
                        companyUnits={companyUnits}
                        groupEnroll={groupEnroll}
                        availableCompanies={getAvailableCompanies}
                        onUpdateField={updateEnrollmentField}
                        onToggleGroup={toggleEnrollmentGroup}
                        onDuplicate={duplicateEnrollment}
                        onSave={handleSaveEnrollment}
                        onDeleteEnrollment={handleDeleteEnrollment}
                        permissions={permissions} // ✅ Pass to child
                    />
                ))}
            </div>

            {filteredCourses.length === 0 && courses.length > 0 && (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Settings className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No courses found
                    </h3>
                    <p className="text-gray-600 mb-4">
                        No courses match your current filters
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setFilterCompany("all");
                            setFilterStatus("all");
                        }}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
}