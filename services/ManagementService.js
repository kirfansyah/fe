import API from './api';

class ManagementService {
    /**
     * Get all courses
     * @returns {Promise} API response
     */

    static async getAllCourses() {
        try {
            const response = await API.get("/trainer/course");
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
     * Get all content types
     * @returns {Promise} API response
     */
    static async getAllContentType() {
        try {
            const response = await API.get("/master/course/content-type");
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
     * Get all group
     * @returns {Promise} API response
     */
    static async getAllgroup() {
        try {
            const response = await API.get("/master/course/grouping");
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
    static async deleteCourse(courseId,deletedBy) {
        try {
            const payload = {
                id_course: courseId,
                deleted_by: deletedBy,       // bisa Anda ganti dinamis sesuai user login
                deleted_device: "web"      // bisa Anda ganti sesuai kebutuhan
            };
            const response = await API.delete("course/delete", { 
                data: payload,
                headers: { 'Content-Type': 'application/json' }
             });
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
     * Update existing course content
     * @param {Number|String} contentId - Content ID
     * @param {Object} pretestData - Course content data
     * @returns {Promise} API response
     */
    static async updatePreTest(contentId, pretestData) {
        try {
            const response = await API.put("course/content", pretestData);
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('ManagementService.updatePreTest Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to update Pre Test');
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

    /**
     * Upload file for course content
     * @param {FormData} fileData - File data
     * @returns {Promise} API response  
     */
    static async uploadContentFile(fileData, onUploadProgress) {
        try {
            const formData = new FormData();
            formData.append('File', fileData.file);
            formData.append('FolderType', ManagementService.getFolderTypeByContentType(fileData.contentTypeId));
            const response = await API.post("/course/content/upload-file", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress : (progressEvent) => {
                    if (onUploadProgress) {
                        const percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                        onUploadProgress(percentCompleted);
                    }
                }
            });
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('ManagementService.uploadContentFile Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to upload file');
        }   
    }

    /**
     * Get folder type based on content type
     */
    static getFolderTypeByContentType(contentTypeId) {
        const mapping = {
            '4': 'pdfs', 
            '5': 'videos', 
            '6': 'docs'     
        };
        return mapping[contentTypeId] || 'others';
    }

    /**
     * Create new course
     * @param {Object} enrollData - Course data
     * @returns {Promise} API response
     */
    static async saveEnrollCourse(enrollData) {
        try {
            const response = await API.post("trainer/course/enrollment", enrollData);
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create Pre Test');
        }
    }

    /**
     * Get all employees with pagination
     * @param {number} page - Page number
     * @param {number} pageSize - Number of items per page
     * @returns {Promise} API response
     */
    static async getAllEmployees(page = 1, pageSize = 10) {
        try {
            const response = await API.get("/employee", {
                params: {
                    page,
                    limit : pageSize
                }
            });
            return {
                success: response.data.success,
                data: response.data.data || [],
                message: response.data.message,
                pagination: response.data.pagination
            };
        }
        catch (error) {
            console.error('ManagementService.getAllEmployees Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch employees');
        }   
    }

    /**
     * Assign employees to group
     * @param {Object} assignData - Assignment data
     * @returns {Promise} API response
    */
    static async assignEmployeesToGroup(assignData) {
        try {
            const response = await API.post("trainer/course/assign-grouping", assignData);
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('ManagementService.assignEmployeesToGroup Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to assign employees to group');
        }
    }

    /**
     * Get Profile Info
     * @returns {Promise} API response
     * /
     */
    static async getProfileInfo() {
        try {
            const response = await API.get("/learner/profile");
            return {
                success: response.data.success,
                data: response.data.data || null,
                message: response.data.message
            };
        } catch (error) {
            console.error('ManagementService.getProfileInfo Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch profile info');
        }
    }



}
export default ManagementService;