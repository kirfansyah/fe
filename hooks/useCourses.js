import { useState, useEffect, useCallback  } from "react";
import API from '/services/managementService';

export function useCourses(){
    const [courses, setCourses] = useState([]);
    const [contentTypes, setcontentTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 

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
    useEffect(() => {
        Promise.all([fetchCourses(), fetchContentTypes()]);
    }, [fetchCourses, fetchContentTypes]);
  return {
    courses, 
    contentTypes,
    loading, 
    error,           
    fetchCourses, 
    addCourse,
    fetchContentTypes
  };
}
