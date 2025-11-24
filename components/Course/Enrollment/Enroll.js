import ListCourses from "@/components/Course/Enrollment/ListCourse";
import { useState, useEffect, useContext } from "react";
import ListEmployees from "@/components/Course/Enrollment/ListEmployee";
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import { Check } from 'lucide-react';
import { useCourses } from "../../../hooks/useCourses";
import { ProfileContext } from "../../../contexts/profile/ProfileContext";
import EnrollmentTabs from "@/components/Course/Enrollment/EnrollmentTabs";
import EnrollmentHeader from "@/components/Course/Enrollment/EnrollmentHeader";

export default function Enroll({
    courses, 
    groupEnroll, 
    companyUnits,
    enrollData,
    activeEnrollmentTab = 'courses-list-sub', 
    setActiveEnrollmentTab,
    onSuccess
}) {
    const [loading, setLoading] = useState(false);
    const { showLoading, showSuccess, showError, confirmAction } = useSweetAlert();
    const { handleSaveEnroll, fetchCourses, fetchEnrollData } = useCourses();
    const { dataKaryawan } = useContext(ProfileContext);
    const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];
    
    // Transform enrollData to use id_course as key
    const [enrollmentData, setEnrollmentData] = useState(() => {
        return transformEnrollData(enrollData);
    });
    
    // Update when enrollData changes
    useEffect(() => {
        const transformed = transformEnrollData(enrollData);
        setEnrollmentData(transformed);
        console.log('🔄 Updated enrollmentData:', transformed);
    }, [enrollData]);

    // Transform helper function
    function transformEnrollData(data) {
        const transformed = {};
        
        Object.values(data || {}).forEach(course => {
            if (course.id_course) {
                transformed[course.id_course] = {
                    ...course,
                    enrollments: course.enrollments || []
                };
            }
        });
        
        console.log('🔄 Transformed enrollmentData:', transformed);
        return transformed;
    }
    
    // Handle course changes from child components
    const handleCourseChange = (courseId, field, value) => {
        console.log('📝 handleCourseChange:', { courseId, field, valueType: typeof value });
        
        if (field === 'save_single') {
            const { enrollment, index } = value;
            
            // Save to backend
            saveSingleEnrollment({
                courseId: courseId,
                enrollment: enrollment,
                index: index
            });
            
            // Update local state
            updateLocalEnrollmentState(courseId, index, enrollment);
            
        } else if (field === 'enrollments') {
            // Handle normal enrollment updates
            updateCourseEnrollments(courseId, value);
        }
    };

    // Update local state after save
    const updateLocalEnrollmentState = (courseId, index, enrollment) => {
        setEnrollmentData(prev => {
            const currentCourse = prev[courseId];
            if (!currentCourse) {
                console.error('❌ Course not found:', courseId);
                return prev;
            }
            
            const updatedEnrollments = [...(currentCourse.enrollments || [])];
            updatedEnrollments[index] = enrollment;
            
            return {
                ...prev,
                [courseId]: {
                    ...currentCourse,
                    enrollments: updatedEnrollments
                }
            };
        });
    };

    // Update course enrollments
    const updateCourseEnrollments = (courseId, enrollments) => {
        setEnrollmentData(prev => {
            const currentCourse = prev[courseId];
            
            if (!currentCourse) {
                console.error('❌ Course not found:', courseId);
                console.log('Available courses:', Object.keys(prev));
                return prev;
            }
            
            console.log('✅ Updating enrollments for course:', courseId);
            console.log('New enrollments count:', enrollments.length);
            
            return {
                ...prev,
                [courseId]: {
                    ...currentCourse,
                    enrollments: enrollments
                }
            };
        });
    };

    // Save single enrollment to backend
    const saveSingleEnrollment = async (enrollmentData) => {
        try {
            showLoading('Saving enrollment...');
            
            const isUpdate = !!enrollmentData.enrollment.id_course_enrollment;
            
            const transformedData = {
                id_course: parseInt(enrollmentData.courseId),
                company_id: enrollmentData.enrollment.company_id,
                id_enrollment_type: enrollmentData.enrollment.enroll_type_name === 'General' ? 1 : 
                                enrollmentData.enrollment.id_enrollment_type || 2,
                id_course_status: enrollmentData.enrollment.course_status_name === 'Mandatory' ? 1 : 
                                enrollmentData.enrollment.id_course_status || 2,
                publish_date: new Date(enrollmentData.enrollment.publish_date).toISOString(),
                end_date: enrollmentData.enrollment.end_date ? 
                    new Date(enrollmentData.enrollment.end_date).toISOString() : null,
                remedial_allowed: enrollmentData.enrollment.remedial_allowed === 'Yes' || 
                                enrollmentData.enrollment.remedial_allowed === true,
                remedial_limit: enrollmentData.enrollment.remedial_limit || 
                            enrollmentData.enrollment.remedial_limit || 1,
                created_by: dataKaryawans.nama,
                    created_device: "system",
                target_groupings: enrollmentData.enrollment.groupings?.map(g => g.id_grouping) || []
            };
            
            // ✅ PENTING: Tambahkan ID untuk update
            if (isUpdate) {
                transformedData.id_course_enrollment = enrollmentData.enrollment.id_course_enrollment;
            }
            console.log('datatattatata', transformedData);
            const response = await handleSaveEnroll(transformedData);
            
            if (response.success) {
                showSuccess(isUpdate ? 'Enrollment updated successfully!' : 'Enrollment saved successfully!');
                
                // ✅ Refresh data dari backend
                await fetchEnrollData();
            }
        } catch (error) {
            console.error('❌ Save enrollment failed:', error);
            showError('Failed to save enrollment: ' + error.message);
        }
    };

    // Transform enrollment data for bulk API call
    const transformEnrollmentData = (data) => {
        const allEnrollments = [];
        
        Object.entries(data).forEach(([courseId, courseData]) => {
            const enrollments = courseData.enrollments || [];
            
            enrollments.forEach(enrollment => {
                if (enrollment.company_id && 
                    enrollment.enroll_type_name && 
                    enrollment.course_status_name &&
                    enrollment.is_new) {
                    
                    const enrollmentTypeId = enrollment.enroll_type_name === 'General' ? 1 : 2;
                    const courseStatusId = enrollment.course_status_name === 'Mandatory' ? 1 : 2;
                    const remedialAllowed = enrollment.remedial_allowed === 'Yes';
                    
                    const publishDate = new Date(enrollment.publish_date);
                    let endDate;
                    
                    if (enrollment.end_date && enrollment.end_date.trim() !== '') {
                        endDate = new Date(enrollment.end_date);
                    } else {
                        endDate = new Date(publishDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                    }
                    
                    allEnrollments.push({
                        id_course: parseInt(courseId),
                        company_id: enrollment.company_id,
                        id_enrollment_type: enrollmentTypeId,
                        id_course_status: courseStatusId,
                        publish_date: publishDate.toISOString(),
                        end_date: endDate.toISOString(),
                        remedial_allowed: remedialAllowed,
                        remedial_limit: remedialAllowed ? enrollment.remedial_limit : 0,
                        created_by: dataKaryawans.nama,
                        created_device: "System",
                        target_groupings: enrollment.groupings || []
                    });
                }
            });
        });
        
        return allEnrollments;
    };

    // Validate enrollment data
    const validateEnrollmentData = () => {
        const errors = [];
        
        Object.entries(enrollmentData).forEach(([courseId, courseData]) => {
            const course = courses.find(c => c.id_course === parseInt(courseId));
            const courseName = course?.course_title || `Course ${courseId}`;
            const enrollments = courseData.enrollments || [];
            
            enrollments.forEach((enrollment, idx) => {
                if (!enrollment.is_new) return;
                
                if (enrollment.company_id || enrollment.enroll_type_name || enrollment.course_status_name) {
                    if (!enrollment.company_id) {
                        errors.push(`${courseName} (Enrollment ${idx + 1}): Company is required`);
                    }
                    
                    if (!enrollment.enroll_type_name) {
                        errors.push(`${courseName} (Enrollment ${idx + 1}): Enrollment type is required`);
                    }
                    
                    if (!enrollment.course_status_name) {
                        errors.push(`${courseName} (Enrollment ${idx + 1}): Status course is required`);
                    }
                    
                    if (!enrollment.publish_date) {
                        errors.push(`${courseName} (Enrollment ${idx + 1}): Publish date is required`);
                    }
                    
                    if (enrollment.enroll_type_name === 'Specific' && 
                        (!enrollment.enrollment_group_ids || enrollment.enrollment_group_ids.length === 0)) {
                        errors.push(`${courseName} (Enrollment ${idx + 1}): Please select at least one enrollment group`);
                    }
                    
                    if (enrollment.end_date && enrollment.publish_date && 
                        new Date(enrollment.end_date) < new Date(enrollment.publish_date)) {
                        errors.push(`${courseName} (Enrollment ${idx + 1}): End date must be after publish date`);
                    }
                    
                    if (enrollment.remedial_allowed === 'Yes' && 
                        (!enrollment.remedial_limit || isNaN(enrollment.remedial_limit) || enrollment.remedial_limit < 1)) {
                        errors.push(`${courseName} (Enrollment ${idx + 1}): Remedial remedial_limit must be at least 1`);
                    }
                }
            });
        });
        
        return errors;
    };

    // Get count of new enrollments
    const getNewEnrollmentsCount = () => {
        let count = 0;
        Object.values(enrollmentData).forEach(courseData => {
            const enrollments = courseData.enrollments || [];
            count += enrollments.filter(e => 
                e.is_new && 
                e.company_id && 
                e.enroll_type_name && 
                e.course_status_name
            ).length;
        });
        return count;
    };

    // Main handler for bulk enrollment
    const handleConfirmEnrollment = async () => {
        console.log('📦 Enrollment data:', enrollmentData);
        
        const newEnrollmentsCount = getNewEnrollmentsCount();
        if (newEnrollmentsCount === 0) {
            showError('Please add at least one company enrollment');
            return;
        }
        
        const errors = validateEnrollmentData();
        if (errors.length > 0) {
            showError(
                <div>
                    <p className="font-semibold mb-2">Please fix the following errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, idx) => (
                            <li key={idx} className="text-sm">{error}</li>
                        ))}
                    </ul>
                </div>
            );
            return;
        }
        
        const result = await confirmAction(
            'Confirm Enrollment',
            `Are you sure you want to create ${newEnrollmentsCount} new enrollment(s)?`
        );
        
        if (!result.isConfirmed) return;
        
        try {
            setLoading(true);
            showLoading('Processing enrollment...');
            
            const enrollmentArray = transformEnrollmentData(enrollmentData);
            
            console.log('📤 Sending to backend:', enrollmentArray);
            console.log(`📊 Total new enrollments: ${enrollmentArray.length}`);
            
            const response = await handleSaveEnroll(enrollmentArray);
            
            if (response.success) {
                showSuccess(`Successfully created ${newEnrollmentsCount} enrollment(s)!`);
                if (onSuccess) {
                    await fetchCourses();
                    onSuccess();
                }
            }
        } catch (error) {
            console.error('❌ Enrollment failed:', error);
            showError('Failed to enroll courses: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const newEnrollmentsCount = getNewEnrollmentsCount();

    return (
        <>
            {/* Tabs */}
            <EnrollmentTabs 
                activeTab={activeEnrollmentTab}
                onTabChange={setActiveEnrollmentTab}
            />

            {/* Content */}
            <div className="bg-white mt-2 p-4 rounded-lg shadow">
                {activeEnrollmentTab === 'courses-list-sub' && (
                    <div className="space-y-4">
                        {/* Header with Confirm Button */}
                        <EnrollmentHeader
                            loading={loading}
                            coursesCount={courses.length}
                            newEnrollmentsCount={newEnrollmentsCount}
                            onConfirm={handleConfirmEnrollment}
                        />

                        {/* Course List */}
                        <ListCourses 
                            groupEnroll={groupEnroll}
                            companyUnits={companyUnits}
                            onCourseChange={handleCourseChange}
                            enrollmentData={enrollmentData}
                        />
                    </div>
                )}
                
                {activeEnrollmentTab === 'employee-list' && 
                    <ListEmployees 
                        created_by={dataKaryawans?.nama || 'System'}
                    />
                }
                
                {activeEnrollmentTab === 'labor-list' && 
                    <div>Labor List Content</div>
                }
            </div>
        </>
    );
}