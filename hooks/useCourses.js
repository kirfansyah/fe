import { useState, useEffect, useCallback  } from "react";
import API from '../services/ManagementService';
import { useRouter } from 'next/router';

export function useCourses(contentId = null){
    const [courses, setCourses] = useState([]);
    const [contentTypes, setcontentTypes] = useState([]);
    const [contentData, setContentData] = useState(null);
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
            console.error('Error fetching courses:', err);
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
            course_description: "testing",
            created_by: "system",
            created_device: "system",
        };
      
        const newCourse = await API.createCourse(payload);
        await fetchCourses();
        setCourses(prevCourses => [...prevCourses, newCourse.data]);
      
        return newCourse.data; 
    } catch (err) {
        setError(err.message || 'Failed to create course');
        console.error('Error creating course:', err);
        throw err; 
    } finally {
        setLoading(false);
    }
  }, []);

//   get all data content type
  const fetchContentTypes = useCallback(async () => {
        setLoading(true);
        setError(null); 
        
        try {
            const res = await API.getAllContentType();
            setcontentTypes(res.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch courses');
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    }, []);

// Delete Course
    const deleteCourse = async (courseId) => {
        try {
            const res = await API.deleteCourse(courseId);
            if (res.success) {
            // langsung hapus dari state biar UI update
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
            // Call service
            const result = await API.savePreTest(pretestData);
            
            console.log('API Response:', result);
            alert('Pre Test saved successfully!');
            
            // Redirect ke management page
            router.push('/course/management');
            
            return result;
        } catch (err) {
            console.error('Error saving test:', err);
            setError(err.message);
            alert('Failed to save test: ' + err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

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
        Promise.all([fetchCourses(), fetchContentTypes()]);
    }, [fetchCourses, fetchContentTypes]);
    useEffect(() => {
        if (contentId) {
            fetchContentByID(contentId);
        }
    }, [contentId, fetchContentByID]); 
  return {
    courses, 
    contentTypes,
    contentData,
    loading, 
    error,           
    fetchCourses, 
    addCourse,
    fetchContentTypes,
    deleteCourse,
    handleSavePreTest,
    fetchContentByID
  };
}
