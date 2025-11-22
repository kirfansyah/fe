import { useState, useEffect, useCallback, useContext   } from "react";
import API from '../services/ManagementService';
import { useRouter } from 'next/router';

export function useCourses(contentId = null){
    const [courses, setCourses] = useState([]);
    const [contentTypes, setContentTypes] = useState([]);
    const [groupEnroll, setGroupEnroll] = useState([]);
    const [contentData, setContentData] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const [profileInfo, setProfileInfo] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [enrollData, setEnrollData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 
    const router = useRouter();

    // get semua data course
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null); 
        
        try {
            const res = await API.getAllCourses();
            setCourses(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    }, []);

    // save data course
    const addCourse = useCallback(async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const newCourse = await API.createCourse(formData);
            await fetchCourses();
            return newCourse.data; 
        } catch (err) {    
            setError(err.message || 'Failed to create course');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchCourses]);

    //   get all data content type
    const fetchContentTypes = useCallback(async () => {
        setLoading(true);
        setError(null); 
        
        try {
            const res = await API.getAllContentType();
            setContentTypes(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch courses');
            
        } finally {
            setLoading(false);
        }
    }, []);

    //   get all data Group Enroll
    const fetchGroupEnroll = useCallback(async () => {
        setLoading(true);
        setError(null); 
        
        try {
            const res = await API.getAllgroup();
            setGroupEnroll(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch courses');
            
        } finally {
            setLoading(false);
        }
    }, []);

    // //   get all data employee with paging
    const fetchEmployeeData = useCallback( async (page =1, pageSize=10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await API.getAllEmployees(page, pageSize);
            setEmployeeData(response);
        } catch (err) {
            setError(err.message || 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    }, []);
    

    // Delete Course
    const deleteCourse = async (courseId) => {
        try {
            const deletedBy = dataKaryawans?.nama || "System";
            const res = await API.deleteCourse(courseId, deletedBy);
            if (res.success) {
            setCourses((prev) => prev.filter((c) => c.id_course !== courseId));
            }
            return res;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };
    ////save content pre test
    const handleSavePreTest = async (pretestData) => {
        setLoading(true);
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
            setLoading(false);
        }
    };

    

    //handle save assign employee grouping
    const handleSaveAssignEmployeeGrouping = useCallback(async (assignData) => {
        setLoading(true);
        setError(null);
        try {
            let response;
            response = await API.assignEmployeesToGroup(assignData);
            await fetchEmployeeData();
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    },[fetchEmployeeData]);

    //get data content by id
    const fetchContentByID = useCallback(async (contentId) => {
         if (!contentId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await API.getContentById(contentId);
            setContentData(res.data);    
        } catch (err) {
            setError(err.message || 'Failed to fetch content');
            console.error('Error fetching content:', err);
            throw err;
        } finally {
            setLoading(false);
        }  
    }, []);

    //get profile info
    const fetchProfileInfo = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await API.getProfileInfo();
            setProfileInfo(res.data); 
        } catch (err) {
            setError(err.message || 'Failed to fetch profile info');
            console.error('Error fetching profile info:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    //get company units
    const fetchCompanyUnits = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await API.getCompanyUnits();
            setCompanies(res.data); 
        }
        catch (err) {
            setError(err.message || 'Failed to fetch company units');
            console.error('Error fetching company units:', err);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);

    //get all enroll data
    const fetchEnrollData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await API.getEnrollments();
            setEnrollData(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch enrollments');
            console.error('Error fetching enrollments:', err);
            throw err;
        } finally {
            setLoading(false);
        }   
    }, []);

    ////save enroll courses
    const handleSaveEnroll = useCallback(async (enrollDataSend) => {
        setLoading(true);
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
            setLoading(false);
        }
    },([fetchEnrollData]));


    useEffect(() => {
        Promise.all([fetchCourses(), fetchContentTypes(), fetchGroupEnroll(), fetchEmployeeData(), fetchProfileInfo(), fetchCompanyUnits(), fetchEnrollData() ]);
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
    loading, 
    error,           
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
    fetchEnrollData
  };
}
