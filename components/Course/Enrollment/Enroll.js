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
    const { handleSaveEnroll, fetchCourses, fetchEnrollData,deleteEnrolls } = useCourses();
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
    const handleCourseChange = async (courseId, field, value) => {
        console.log('📝 handleCourseChange:', { courseId, field, valueType: typeof value });
        
        if (field === 'save_single') {
            const { enrollment, index } = value;
            
            // ✅ Await save and return result
            const result = await saveSingleEnrollment({
                courseId: courseId,
                enrollment: enrollment,
                index: index
            });
            
            // ✅ Return result for modal to handle
            return result;
            
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
                            enrollmentData.enrollment.times || 1,
                passing_grade: enrollmentData.enrollment.passing_grade ?? 0,
                refreshment_months: enrollmentData.enrollment.refreshment_months || null,
                created_by: dataKaryawans.nama,
                created_device: "system",
                target_groupings: extractGroupingIds(enrollmentData.enrollment.groupings)
            };
            
            if (isUpdate) {
                transformedData.id_course_enrollment = enrollmentData.enrollment.id_course_enrollment;
            }
            
            console.log('📤 Sending enrollment data:', transformedData);
            
            const response = await handleSaveEnroll(transformedData);
            
            if (response.success) {
                await showSuccess(isUpdate ? 'Enrollment updated successfully!' : 'Enrollment saved successfully!');
                
                const updatedEnrollment = {
                    // Keep all form data
                    ...enrollmentData.enrollment,
                    
                    // Add/update from API response
                    id_course_enrollment: response.data,
                    
                    // Mark as saved (not new anymore)
                    is_new: false,
                    
                    // Update other fields from response if available
                    company_name: enrollmentData.enrollment.company_name || 
                                companyUnits.find(c => c.id === enrollmentData.enrollment.company_id)?.company_name,
                    
                    enroll_type_name: enrollmentData.enrollment.enroll_type_name,
                    id_enrollment_type: transformedData.id_enrollment_type,
                    
                    course_status_name: enrollmentData.enrollment.course_status_name,
                    id_course_status: transformedData.id_course_status,
                    
                    publish_date: enrollmentData.enrollment.publish_date,
                    end_date: enrollmentData.enrollment.end_date,
                    
                    remedial_allowed: transformedData.remedial_allowed,
                    remedial_limit: transformedData.remedial_limit,
                    
                    passing_grade: transformedData.passing_grade,
                    refreshment_months: transformedData.refreshment_months,
                    
                    // Keep groupings as clean array
                    groupings: extractGroupingIds(enrollmentData.enrollment.groupings),
                    
                    // Add timestamps if in response
                    created_at: response.data.created_at || new Date().toISOString(),
                    created_by: transformedData.created_by,
                    updated_at: response.data.updated_at || null,
                    updated_by: response.data.updated_by || null
                };
                
                
                console.log('💾 Updating state, is_new:', updatedEnrollment);
                // ✅ Update local state immediately
                updateLocalEnrollmentState(
                    enrollmentData.courseId, 
                    enrollmentData.index, 
                    updatedEnrollment
                );

                 fetchEnrollData();
                
                
                return { success: true };
            }
            
            return { success: false };
            
        } catch (error) {
            console.error('❌ Save enrollment failed:', error);
            await showError('Failed to save enrollment: ' + error.message);
            return { success: false };
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
                        remedial_limit: remedialAllowed ? (enrollment.remedial_limit || enrollment.times || 1) : 0,
                        passing_grade: enrollment.passing_grade ?? 0, // ✅ New field
                        refreshment_months: enrollment.refreshment_months || null, // ✅ New field
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

                    // ✅ Validate passing_grade
                    if (enrollment.passing_grade === undefined || enrollment.passing_grade === null) {
                        errors.push(`${courseName} (Enrollment ${idx + 1}): Minimum score is required`);
                    } else if (enrollment.passing_grade < 0 || enrollment.passing_grade > 100) {
                        errors.push(`${courseName} (Enrollment ${idx + 1}): Minimum score must be between 0 and 100`);
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
                        errors.push(`${courseName} (Enrollment ${idx + 1}): Remedial limit must be at least 1`);
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
        
        const result = await confirmAction({
            title: 'Confirm Enrollment',
            text: `Are you sure you want to create ${newEnrollmentsCount} new enrollment(s)?`
        });
        
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
            <div className="">
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
                            deleteEnrolls={deleteEnrolls}
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