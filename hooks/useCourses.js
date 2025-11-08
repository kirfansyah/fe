import { useState, useEffect, useCallback, useContext   } from "react";
import API from '../services/ManagementService';
import { useRouter } from 'next/router';
import { ProfileContext } from '../contexts/profile/ProfileContext';
export function useCourses(contentId = null){
    const [courses, setCourses] = useState([]);
    const [contentTypes, setContentTypes] = useState([]);
    const [groupEnroll, setGroupEnroll] = useState([]);
    const [contentData, setContentData] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 
    const router = useRouter();

    const { dataKaryawan } = useContext(ProfileContext);
    const dataKaryawans = dataKaryawan?.length ? dataKaryawan[0] : null;

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
    const addCourse = useCallback(async (courseName) => {
        setLoading(true);
        setError(null);
        
        try {
            const payload = {
                course_title: courseName,
                created_by: dataKaryawans?.nama || "System",
                created_device: "system",
            };
        
            const newCourse = await API.createCourse(payload);
            await fetchCourses();
            return newCourse.data; 
        } catch (err) {    
            setError(err.message || 'Failed to create course');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [dataKaryawans, fetchCourses]);

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

    ////save enroll courses
    const handleSaveEnroll = useCallback(async (enrollData) => {
        setLoading(true);
        setError(null);
        
        try {
            let response;
            response = await API.saveEnrollCourse(enrollData);
            await fetchCourses();
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    },([fetchCourses]));

    //handle save assign employee grouping
    const handleSaveAssignEmployeeGrouping = useCallback(async (assignData) => {
        setLoading(true);
        setError(null);
        try {
            let response;
            response = await API.assignEmployeesToGroup(assignData);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    },[]);

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


    useEffect(() => {
        Promise.all([fetchCourses(), fetchContentTypes(), fetchGroupEnroll(), fetchEmployeeData()]);
    }, [fetchCourses, fetchContentTypes, fetchGroupEnroll, fetchEmployeeData]);
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
    fetchContentByID
  };
}
