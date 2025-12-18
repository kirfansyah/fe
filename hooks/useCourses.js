// hooks/useCourses.js
import { useState, useEffect, useCallback, useContext } from "react";
import ManagementService from '@/services/ManagementService';
import { useRouter } from 'next/router';
import { ProfileContext } from '@/contexts/profile/ProfileContext';

export function useCourses(contentId = null) {
    const [courses, setCourses] = useState([]);
    const [contentTypes, setContentTypes] = useState([]);
    const [groupEnroll, setGroupEnroll] = useState([]);
    const [contentData, setContentData] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const [profileInfo, setProfileInfo] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [enrollData, setEnrollData] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);
    const [error, setError] = useState(null);
    
    const router = useRouter();
    const { dataKaryawan } = useContext(ProfileContext);
    const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : {};

    // ✅ GET all courses
    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const result = await ManagementService.getAllCourses();
        
        if (result.success) {
            setCourses(result.data);
        } else {
            setError(result.message);
        }
        
        setIsLoading(false);
    }, []);

    // ✅ CREATE course
    const addCourse = useCallback(async (formData) => {
        setIsSaving(true);
        setError(null);
        
        const result = await ManagementService.createCourse(formData);
        
        if (result.success) {
            await fetchCourses();
            await fetchEnrollData();
        } else {
            setError(result.message);
        }
        
        setIsSaving(false);
        return result;
    }, [fetchCourses]);

    // ✅ GET content types
    const fetchContentTypes = useCallback(async () => {
        setError(null);
        
        const result = await ManagementService.getAllContentType();
        
        if (result.success) {
            setContentTypes(result.data);
        } else {
            setError(result.message);
        }
    }, []);

    // ✅ GET groups
    const fetchGroupEnroll = useCallback(async () => {
        setError(null);
        
        const result = await ManagementService.getAllgroup();
        
        if (result.success) {
            setGroupEnroll(result.data);
        } else {
            setError(result.message);
        }
    }, []);

    // ✅ CREATE group
    const addGroupEnroll = useCallback(async (GroupEnrollData) => {
        setIsSaving(true);
        setError(null);
        
        const result = await ManagementService.createGroupEnroll(GroupEnrollData);
        
        if (result.success) {
            await fetchGroupEnroll();
        } else {
            setError(result.message);
        }
        
        setIsSaving(false);
        return result;
    }, [fetchGroupEnroll]);

    // ✅ GET employees
    const fetchEmployeeData = useCallback(async (page = 1, pageSize = 10) => {
        setError(null);
        
        const result = await ManagementService.getAllEmployees(page, pageSize);
        
        if (result.success) {
            setEmployeeData(result);
        } else {
            setError(result.message);
        }
    }, []);

    // ✅ DELETE course
    const deleteCourse = useCallback(async (courseId) => {
        setIsDeleting(courseId);
        setError(null);
        
        const deletedBy = dataKaryawans?.nama || "System";
        const result = await ManagementService.deleteCourse(courseId, deletedBy);
        
        if (result.success) {
            setCourses((prev) => prev.filter((c) => c.id_course !== courseId));
        } else {
            setError(result.message);
        }
        
        setIsDeleting(null);
        return result;
    }, [dataKaryawans]);

    // ✅ SAVE/UPDATE pre-test
    const handleSavePreTest = useCallback(async (pretestData) => {
        setIsSaving(true);
        setError(null);
        
        let result;
        if (pretestData.id_course_content) {
            result = await ManagementService.updatePreTest(
                pretestData.id_course_content,
                pretestData
            );
        } else {
            result = await ManagementService.savePreTest(pretestData);
        }
        
        if (!result.success) {
            setError(result.message);
        }
        
        setIsSaving(false);
        return result;
    }, []);

    // ✅ ASSIGN employees to group
    const handleSaveAssignEmployeeGrouping = useCallback(async (assignData) => {
        setIsSaving(true);
        setError(null);
        
        const result = await ManagementService.assignEmployeesToGroup(assignData);
        
        if (result.success) {
            await fetchEmployeeData();
        } else {
            setError(result.message);
        }
        
        setIsSaving(false);
        return result;
    }, [fetchEmployeeData]);

    // ✅ GET content by ID
    const fetchContentByID = useCallback(async (contentId) => {
        if (!contentId) return;
        
        setError(null);
        
        const result = await ManagementService.getContentById(contentId);
        
        if (result.success) {
            setContentData(result.data);
        } else {
            setError(result.message);
        }
        
        return result;
    }, []);

    // ✅ GET profile info
    const fetchProfileInfo = useCallback(async () => {
        setError(null);
        
        const result = await ManagementService.getProfileInfo();
        
        if (result.success) {
            setProfileInfo(result.data);
        } else {
            setError(result.message);
        }
    }, []);

    // ✅ GET company units
    const fetchCompanyUnits = useCallback(async () => {
        setError(null);
        
        const result = await ManagementService.getCompanyUnits();
        
        if (result.success) {
            setCompanies(result.data);
        } else {
            setError(result.message);
        }
    }, []);

    // ✅ GET enrollments
    const fetchEnrollData = useCallback(async () => {
        setError(null);
        
        const result = await ManagementService.getEnrollments();
        
        if (result.success) {
            setEnrollData(result.data);
        } else {
            setError(result.message);
        }
    }, []);

    // ✅ SAVE/UPDATE enrollment
    const handleSaveEnroll = useCallback(async (enrollDataSend) => {
        setIsSaving(true);
        setError(null);
        
        let result;
        if (enrollDataSend.id_course_enrollment) {
            result = await ManagementService.updateEnrollCourse(enrollDataSend);
        } else {
            result = await ManagementService.saveEnrollCourse(enrollDataSend);
        }
        
        if (result.success) {
            await fetchEnrollData();
        } else {
            setError(result.message);
        }
        
        setIsSaving(false);
        return result;
    }, [fetchEnrollData]);

    // ✅ DELETE course
    const deleteEnrolls = useCallback(async (enrollmentId) => {
        setIsDeleting(enrollmentId);
        setError(null);
        
        const deletedBy = dataKaryawans?.nama || "System";
        const result = await ManagementService.deleteEnrolls(enrollmentId, deletedBy);
        
        if (result.success) {
            setEnrollData((prev) => prev.filter((c) => c.id_course_enrollment !== enrollmentId));
        } else {
            setError(result.message);
        }
        
        setIsDeleting(null);
        return result;
    }, [dataKaryawans]);

    // ✅ Initial load
    useEffect(() => {
        Promise.all([
            fetchCourses(),
            fetchContentTypes(),
            fetchGroupEnroll(),
            fetchEmployeeData(),
            fetchProfileInfo(),
            fetchCompanyUnits(),
            fetchEnrollData()
        ]);
    }, [fetchCourses, fetchContentTypes, fetchGroupEnroll, fetchEmployeeData, fetchProfileInfo, fetchCompanyUnits, fetchEnrollData]);

    useEffect(() => {
        if (contentId) {
            fetchContentByID(contentId);
        }
    }, [contentId, fetchContentByID]);

    return {
        courses,
        contentTypes,
        contentData,
        groupEnroll,
        employeeData,
        profileInfo,
        companies,
        enrollData,
        isLoading,
        isSaving,
        isDeleting,
        error,
        fetchCourses,
        addCourse,
        fetchContentTypes,
        fetchGroupEnroll,
        fetchEmployeeData,
        deleteCourse,
        deleteEnrolls,
        handleSavePreTest,
        handleSaveEnroll,
        handleSaveAssignEmployeeGrouping,
        fetchContentByID,
        fetchProfileInfo,
        fetchCompanyUnits,
        fetchEnrollData,
        addGroupEnroll
    };
}