import API from 'contexts/api';

class ManagementService {
    /**
     * Get all courses
     * @returns {Promise} API response
     */

    static async getAllCourses() {
        try {
            const response = await API.get("/course/nested");
            return {
                success: response.data.success,
                data: response.data.data || [],
                message: response.data.message,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('ManagementService.getAllCourses Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch courses');
        }
    }

    static async getAllContentType() {
        try {
            const response = await API.get("/course/content-types");
            return {
                success: response.data.success,
                data: response.data.data || [],
                message: response.data.message,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('ManagementService.getAllCourses Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch courses');
        }
    }

    /**
     * Create new course
     * @param {Object} courseData - Course data
     * @returns {Promise} API response
     */
    static async createCourse(courseData) {
        try {
            const response = await API.post("course", courseData);
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('ManagementService.createCourse Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to create course');
        }
    }


}
export default ManagementService;