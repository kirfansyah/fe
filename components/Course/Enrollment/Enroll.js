import ListCourses from "@/components/Course/Enrollment/ListCourse";
import { useState, useEffect,useContext, use } from "react";
import ListEmployees from "@/components/Course/Enrollment/ListEmployee";
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import { Check } from 'lucide-react';
import { useCourses } from "../../../hooks/useCourses";
import { ProfileContext } from "../../../contexts/profile/ProfileContext";
export default function Enroll({
    courses, 
    groupEnroll, 
    activeEnrollmentTab = 'courses-list-sub', 
    setActiveEnrollmentTab,
    onSuccess
}) {
    const [enrollmentData, setEnrollmentData] = useState({});
    const [loading, setLoading] = useState(false);
    const { showLoading, showSuccess, showError, confirmAction } = useSweetAlert();
    const { handleSaveEnroll, fetchCourses } = useCourses();
    const { getKaryawan, dataKaryawan } = useContext(ProfileContext);
    const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];
    // ⭐ Initialize dengan check enrolled status
    useEffect(() => {
        const initialData = {};
        
        courses.forEach(course => {
            const isEnrolled = course.id_course_enrollment !== null;
            
            if (isEnrolled) {
                // ⭐ Course sudah enrolled - populate data existing
                initialData[course.id_course] = {
                    id_course: course.id_course,
                    enrollment_type: course.id_enrollment_type === 1 ? 'General' : 'Specific',
                    status_course: course.id_course_status === 1 ? 'Mandatory' : 'Optional',
                    publish_date: course.publish_date 
                        ? new Date(course.publish_date).toISOString().split('T')[0]
                        : '',
                    end_date: course.end_date 
                        ? new Date(course.end_date).toISOString().split('T')[0]
                        : '',
                    remedial_allowed: course.remedial_allowed ? 'Yes' : 'No',
                    times: course.remedial_limit || 1,
                    enrollment_group_ids: course.groupings?.map(g => g.id_grouping) || [],
                    _isExisting: true,
                    _enrollmentId: course.id_course_enrollment
                };
            } else {
                // ⭐ Course belum enrolled - set empty untuk trigger filter
                initialData[course.id_course] = {
                    id_course: course.id_course,
                    enrollment_type: '',  // ⭐ Empty = belum diisi
                    status_course: '',    // ⭐ Empty = belum diisi
                    publish_date: '',
                    end_date: '',
                    remedial_allowed: 'Yes',
                    times: 1,
                    enrollment_group_ids: [],
                    _isExisting: false,
                    _enrollmentId: null
                };
            }
        });
        
        console.log('📊 Initialized enrollment data:', initialData);
        setEnrollmentData(initialData);
    }, [courses]);

    // Handle perubahan field
    const handleCourseChange = (courseId, field, value) => {
        setEnrollmentData(prev => ({
            ...prev,
            [courseId]: {
                ...prev[courseId],
                [field]: value,
                // Reset enrollment_group_ids jika type berubah ke General
                ...(field === 'enrollment_type' && value === 'General' && {
                    enrollment_group_ids: []
                })
            }
        }));
    };

    useEffect(() => {fetchCourses();}, [fetchCourses]);

    // ⭐ Transform dengan filter hanya yang diisi
    const transformEnrollmentData = (data) => {
        // ⭐ Filter hanya yang enrollment_type DAN status_course sudah diisi
        const filledData = Object.values(data).filter(courseData => 
            courseData.enrollment_type && 
            courseData.enrollment_type !== '' &&
            courseData.status_course &&
            courseData.status_course !== ''
        );

        console.log(`📊 Total courses: ${Object.keys(data).length}, Filled: ${filledData.length}`);

        return filledData.map(courseData => {
            const enrollmentTypeId = courseData.enrollment_type === 'General' ? 1 : 2;
            const courseStatusId = courseData.status_course === 'Mandatory' ? 1 : 2;
            const remedialAllowed = courseData.remedial_allowed === 'Yes';

            // ⭐ Calculate dates properly
            const publishDate = new Date(courseData.publish_date);
            let endDate;
            
            if (courseData.end_date && courseData.end_date.trim() !== '') {
                endDate = new Date(courseData.end_date);
            } else {
                // Default: 30 days from publish date
                endDate = new Date(publishDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            }

            return {
                id_course: courseData.id_course,
                id_enrollment_type: enrollmentTypeId,
                id_course_status: courseStatusId,
                publish_date: publishDate.toISOString(),
                end_date: endDate.toISOString(),
                remedial_allowed: remedialAllowed,
                remedial_limit: remedialAllowed ? courseData.times : 0,
                created_by: dataKaryawans.nama,
                created_device: "System",
                target_groupings: courseData.enrollment_group_ids || []
            };
        });
    };

    // ⭐ Validasi hanya untuk yang diisi
    const validateEnrollmentData = () => {
        const errors = [];

        // ⭐ Filter hanya yang sudah mulai diisi
        const filledCourses = Object.entries(enrollmentData).filter(([_, data]) => 
            data.enrollment_type && data.enrollment_type !== ''
        );

        console.log(`Validating ${filledCourses.length} filled courses...`);

        filledCourses.forEach(([courseId, data]) => {
            const course = courses.find(c => c.id_course === parseInt(courseId));
            const courseName = course?.course_title || `Course ${courseId}`;

            // Validasi status course required
            if (!data.status_course || data.status_course === '') {
                errors.push(`${courseName}: Status course is required`);
            }

            // Validasi Specific harus pilih minimal 1 group
            if (data.enrollment_type === 'Specific' && 
                (!data.enrollment_group_ids || data.enrollment_group_ids.length === 0)) {
                errors.push(`${courseName}: Please select at least one enrollment group`);
            }

            // Validasi tanggal
            if (!data.publish_date || data.publish_date === '') {
                errors.push(`${courseName}: Publish date is required`);
            }

            if (data.end_date && data.publish_date && 
                new Date(data.end_date) < new Date(data.publish_date)) {
                errors.push(`${courseName}: End date must be after publish date`);
            }

            // Validasi times
            if (data.remedial_allowed === 'Yes' && 
                (!data.times || isNaN(data.times) || data.times < 1)) {
                errors.push(`${courseName}: Remedial times must be at least 1 if remedial is allowed`);
            }
        });

        return errors;
    };

    // ⭐ Count hanya yang diisi
    const getFilledCoursesCount = () => {
        return Object.values(enrollmentData).filter(
            data => data.enrollment_type && data.enrollment_type !== ''
        ).length;
    };

    // Main handler
    const handleConfirmEnrollment = async () => {
        console.log('📦 Enrollment data (before transform):', enrollmentData);

        // ⭐ Check apakah ada yang diisi
        const filledCount = getFilledCoursesCount();
        if (filledCount === 0) {
            showError('Please select enrollment type for at least one course');
            return;
        }

        // Validasi
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

        // Confirm dialog
        const result = await confirmAction(
            'Confirm Enrollment',
            `Are you sure you want to enroll ${filledCount} course(s)?`
        );

        if (!result.isConfirmed) return;

        try {
            setLoading(true);
            showLoading('Processing enrollment...');

            // ⭐ Transform (auto-filter yang diisi)
            const enrollmentArray = transformEnrollmentData(enrollmentData);
            
            console.log('📤 Sending to backend:', enrollmentArray);
            console.log(`📊 Total enrollments: ${enrollmentArray.length}`);


            // Call API
            const response = await handleSaveEnroll(enrollmentArray);
            
            if (response.success) {
                showSuccess(`Successfully enrolled ${filledCount} course(s)!`);
                if (onSuccess) {
                    fetchCourses();
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

    // ⭐ Get filled count untuk UI
    const filledCoursesCount = getFilledCoursesCount();

    return (
        <>
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveEnrollmentTab('courses-list-sub')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeEnrollmentTab === 'courses-list-sub'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Course List Sub
                        </button>
                        <button
                            onClick={() => setActiveEnrollmentTab('employee-list')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeEnrollmentTab === 'employee-list'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Employee List
                        </button>
                        <button
                            onClick={() => setActiveEnrollmentTab('labor-list')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeEnrollmentTab === 'labor-list'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Labor List
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white mt-2 p-4 rounded-lg shadow">
                {activeEnrollmentTab === 'courses-list-sub' && (
                    <div className="space-y-4">
                        {/* Header with Confirm Button */}
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Course Enrollment
                                </h3>
                                {/* ⭐ Show count */}
                                <p className="text-sm text-gray-600 mt-1">
                                    {filledCoursesCount} of {courses.length} courses selected
                                </p>
                            </div>
                            <button 
                                onClick={handleConfirmEnrollment}
                                disabled={loading || courses.length === 0 || filledCoursesCount === 0}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Check className="w-4 h-4" />
                                <span className="font-medium">
                                    {loading ? 'Processing...' : `Confirm Enrollment (${filledCoursesCount})`}
                                </span>
                            </button>
                        </div>

                        {/* Course List */}
                        <ListCourses 
                            courses={courses}
                            groupEnroll={groupEnroll}
                            onCourseChange={handleCourseChange}
                            enrollmentData={enrollmentData}
                        />
                    </div>
                )}
                
                {activeEnrollmentTab === 'employee-list' && 
                    <ListEmployees 
                        created_by={dataKaryawans?.nama || 'System'}
                    />}
                {activeEnrollmentTab === 'labor-list' && <div>Labor List Content</div>}
            </div>
        </>
    );
}