import API from './api';

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

    /**
     * Delete course
     * @param {number} courseId - Course ID
     * @returns {Promise} API response
     */
    static async deleteCourse(courseId) {
        try {
            const payload = {
                id_course: courseId,
                deleted_by: "admin",       // bisa Anda ganti dinamis sesuai user login
                deleted_device: "web"      // bisa Anda ganti sesuai kebutuhan
            };
            const response = await API.put("course/delete", payload);
            return {
                success: response.data.success,
                message: response.data.message
            };
        } catch (error) {
            console.error('ManagementService.deleteCourse Error:', error);
            throw new Error(error.response?.data?.message || `Failed to delete course ${courseId}`);
        }
    }

    /**
     * Create new course
     * @param {Object} pretestData - Course data
     * @returns {Promise} API response
     */
    static async savePreTest(pretestData) {
        try {
            const response = await API.post("course/content", pretestData);
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('ManagementService.savePreTest Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to create Pre Test');
        }
    }
    /** 
     * Get content by ID
     * @param {number} contentId - Content ID
     * @return {Promise} API response
    */
    static async getContentById(contentId) {
        try {
            const response = await API.get(`/course/content/${contentId}`); 
            return {
                success: response.data.success,
                data: response.data.data || null,
                message: response.data.message
            };
        } catch (error) {
            console.error('ManagementService.getContentById Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch content');
        }
    }



}
export default ManagementService;