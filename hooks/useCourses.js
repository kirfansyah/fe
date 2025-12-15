import { useState, useEffect, useCallback, useContext } from "react";
import API from '../services/ManagementService';
import { useRouter } from 'next/router';
import { ProfileContext } from '@/contexts/profile/ProfileContext'; // ← Import untuk dataKaryawans

export function useCourses(contentId = null) {
    const [courses, setCourses] = useState([]);
    const [contentTypes, setContentTypes] = useState([]);
    const [groupEnroll, setGroupEnroll] = useState([]);
    const [contentData, setContentData] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const [profileInfo, setProfileInfo] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [enrollData, setEnrollData] = useState([]);
    
    // ✅ SEPARATE LOADING STATES
    const [isLoading, setIsLoading] = useState(true);        // Initial data fetch
    const [isSaving, setIsSaving] = useState(false);         // Save operations
    const [isDeleting, setIsDeleting] = useState(null);      // Delete operations (track courseId)
    const [error, setError] = useState(null);
    
    const router = useRouter();
    const { dataKaryawan } = useContext(ProfileContext);
    const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : [];

    // ✅ GET semua data course
    const fetchCourses = useCallback(async () => {
        setIsLoading(true); 
        setError(null);
        
        try {
            const res = await API.getAllCourses();
            setCourses(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch courses');
        } finally {
            setIsLoading(false); 
        }
    }, []);

    // ✅ SAVE data course
    const addCourse = useCallback(async (formData) => {
        setIsSaving(true); // ← Changed to setIsSaving
        setError(null);
        try {
            const newCourse = await API.createCourse(formData);
            await fetchCourses(); // Refresh courses list
            await fetchEnrollData();
            return newCourse.data;
        } catch (err) {
            setError(err.message || 'Failed to create course');
            throw err;
        } finally {
            setIsSaving(false); // ← Changed to setIsSaving
        }
    }, [fetchCourses]);

    // ✅ GET all data content type
    const fetchContentTypes = useCallback(async () => {
        // Don't set isLoading untuk secondary data
        setError(null);
        
        try {
            const res = await API.getAllContentType();
            setContentTypes(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch content types');
        }
    }, []);

    // ✅ GET all data Group Enroll
    const fetchGroupEnroll = useCallback(async () => {
        setError(null);
        
        try {
            const res = await API.getAllgroup();
            setGroupEnroll(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch groups');
        }
    }, []);

    // ✅ GET all data content type
    const addGroupEnroll = useCallback(async (GroupEnrollData) => {
        setIsSaving(true); // ← Changed to setIsSaving
        setError(null);
        try {
            const newCourse = await API.createGroupEnroll(GroupEnrollData);
            await fetchGroupEnroll(); // Refresh courses list
            return newCourse.data;
        } catch (err) {
            setError(err.message || 'Failed to create course');
            throw err;
        } finally {
            setIsSaving(false); // ← Changed to setIsSaving
        }
    }, [fetchCourses]);

    // ✅ GET all data employee with paging
    const fetchEmployeeData = useCallback(async (page = 1, pageSize = 10) => {
        setError(null);
        try {
            const response = await API.getAllEmployees(page, pageSize);
            setEmployeeData(response);
        } catch (err) {
            setError(err.message || 'Failed to fetch employees');
        }
    }, []);

    // ✅ DELETE Course (FIXED - added loading state)
    const deleteCourse = useCallback(async (courseId) => {
        setIsDeleting(courseId); // ← ADDED: Track which course is being deleted
        setError(null);
        
        try {
            const deletedBy = dataKaryawans?.nama || "System";
            const res = await API.deleteCourse(courseId, deletedBy);
            
            if (res.success) {
                setCourses((prev) => prev.filter((c) => c.id_course !== courseId));
            }
            
            return res;
        } catch (err) {
            setError(err.message || 'Failed to delete course');
            throw err;
        } finally {
            setIsDeleting(null); // ← ADDED: Clear deleting state
        }
    }, [dataKaryawans]);

    // ✅ SAVE content pre test
    const handleSavePreTest = async (pretestData) => {
        setIsSaving(true); // ← Changed to setIsSaving
        setError(null);
        
        try {
            let response;
            if (pretestData.id_course_content) {
                response = await API.updatePreTest(
                    pretestData.id_course_content,
                    pretestData
                );
            } else {
                response = await API.savePreTest(pretestData);
            }
            
            if (!response.success) {
                throw new Error(response.message || 'Failed to save Pretest');
            }
            
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsSaving(false); // ← Changed to setIsSaving
        }
    };

    // ✅ HANDLE save assign employee grouping
    const handleSaveAssignEmployeeGrouping = useCallback(async (assignData) => {
        setIsSaving(true); // ← Changed to setIsSaving
        setError(null);
        
        try {
            const response = await API.assignEmployeesToGroup(assignData);
            await fetchEmployeeData();
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsSaving(false); // ← Changed to setIsSaving
        }
    }, [fetchEmployeeData]);

    // ✅ GET data content by id
    const fetchContentByID = useCallback(async (contentId) => {
        if (!contentId) return;
        
        setError(null);
        try {
            const res = await API.getContentById(contentId);
            setContentData(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch content');
            console.error('Error fetching content:', err);
            throw err;
        }
    }, []);

    // ✅ GET profile info
    const fetchProfileInfo = useCallback(async () => {
        setError(null);
        try {
            const res = await API.getProfileInfo();
            setProfileInfo(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch profile info');
            console.error('Error fetching profile info:', err);
            throw err;
        }
    }, []);

    // ✅ GET company units
    const fetchCompanyUnits = useCallback(async () => {
        setError(null);
        try {
            const res = await API.getCompanyUnits();
            setCompanies(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch company units');
            console.error('Error fetching company units:', err);
            throw err;
        }
    }, []);

    // ✅ GET all enroll data
    const fetchEnrollData = useCallback(async () => {
        setError(null);
        try {
            const res = await API.getEnrollments();
            setEnrollData(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch enrollments');
            console.error('Error fetching enrollments:', err);
            throw err;
        }
    }, []);

    // ✅ SAVE enroll courses
    const handleSaveEnroll = useCallback(async (enrollDataSend) => {
        setIsSaving(true); // ← Changed to setIsSaving
        setError(null);
        
        try {
            let response;
            if (enrollDataSend.id_course_enrollment) {
                response = await API.updateEnrollCourse(enrollDataSend);
            } else {
                response = await API.saveEnrollCourse(enrollDataSend);
            }
            
            await fetchEnrollData();
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsSaving(false); // ← Changed to setIsSaving
        }
    }, [fetchEnrollData]);

    // ✅ INITIAL DATA FETCH
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
        // Data
        courses,
        contentTypes,
        contentData,
        groupEnroll,
        employeeData,
        profileInfo,
        companies,
        enrollData,
        
        // ✅ LOADING STATES (Renamed & Added)
        isLoading,      // ← Changed from 'loading'
        isSaving,       // ← NEW
        isDeleting,     // ← NEW
        error,
        
        // Functions
        fetchCourses,
        addCourse,
        fetchContentTypes,
        fetchGroupEnroll,
        fetchEmployeeData,
        deleteCourse,
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