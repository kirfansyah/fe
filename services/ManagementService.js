// services/ManagementService.js
import API from './api'; // ✅ Import dari contexts

class ManagementService {
    /**
     * Get all courses
     * @returns {Promise} API response
     */
    static async getAllCourses() {
        try {
            const response = await API.get("/trainer/course");
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Success',
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('ManagementService.getAllCourses Error:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Failed to fetch courses',
                pagination: null
            };
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
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Success',
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('ManagementService.getAllContentType Error:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Failed to fetch content types',
                pagination: null
            };
        }
    }

    /**
     * Get all groups
     * @returns {Promise} API response
     */
    static async getAllgroup() {
        try {
            const response = await API.get("/master/course/grouping");
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Success',
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('ManagementService.getAllgroup Error:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Failed to fetch groups',
                pagination: null
            };
        }
    }

    /**
     * Create group enrollment
     * @param {Object} GroupEnrollData - Group enrollment data
     * @returns {Promise} API response
     */
    static async createGroupEnroll(GroupEnrollData) {
        try {
            const response = await API.post("/master/course/grouping", GroupEnrollData);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Group created successfully'
            };
        } catch (error) {
            console.error('ManagementService.createGroupEnroll Error:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to create group'
            };
        }
    }

    /**
     * Create group enrollment
     * @param {Object} GroupEnrollData - Group enrollment data
     * @returns {Promise} API response
     */
    static async updateGroupEnroll(GroupEnrollData) {
        try {
            const response = await API.put("/master/course/grouping/update", GroupEnrollData);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Group updated successfully'
            };
        } catch (error) {
            console.error('ManagementService.updateGroupEnroll Error:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to update group'
            };
        }
    }

    /**
     * Create new course
     * @param {FormData} formData - Course form data
     * @returns {Promise} API response
     */
    static async createCourse(formData) {
        try {
            const response = await API.post("/trainer/course", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Course created successfully'
            };
        } catch (error) {
            console.error('ManagementService.createCourse Error:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to create course'
            };
        }
    }

    /**
     * Delete course
     * @param {number} courseId - Course ID
     * @param {string} deletedBy - User who deleted
     * @returns {Promise} API response
     */
    static async deleteCourse(courseId, deletedBy) {
        try {
            const payload = {
                id_course: courseId,
                deleted_by: deletedBy,
                deleted_device: "web"
            };
            const response = await API.delete("/trainer/course/delete", { 
                data: payload,
                headers: { 'Content-Type': 'application/json' }
            });
            return {
                success: true,
                message: response.data.message || 'Course deleted successfully'
            };
        } catch (error) {
            console.error('ManagementService.deleteCourse Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || `Failed to delete course ${courseId}`
            };
        }
    }

    /**
     * Delete content
     * @param {number} contentId - Content ID
     * @param {string} deletedBy - User who deleted
     * @returns {Promise} API response
     */
    static async deleteContent(contentId, deletedBy) {
        try {
            const payload = {
                id_course_content: contentId,
                deleted_by: deletedBy,
                deleted_device: "web"
            };
            const response = await API.delete("/trainer/course/content/delete", { 
                data: payload,
                headers: { 'Content-Type': 'application/json' }
            });
            return {
                success: true,
                message: response.data.message || 'Content deleted successfully'
            };
        } catch (error) {
            console.error('ManagementService.deleteContent Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || `Failed to delete content ${contentId}`
            };
        }
    }

    /**
     * Delete course
     * @param {number} enrollmentId - Course ID
     * @param {string} deletedBy - User who deleted
     * @returns {Promise} API response
     */
    static async deleteEnrolls(enrollmentId, deletedBy) {
        
        try {
            const payload = {
                id_course_enrollment: enrollmentId,
                deleted_by: deletedBy,
                deleted_device: "web"
            };
            const response = await API.delete("/trainer/course/enrollment/delete", { 
                data: payload,
                headers: { 'Content-Type': 'application/json' }
            });
            return {
                success: true,
                message: response.data.message || 'Course deleted successfully'
            };
        } catch (error) {
            console.error('ManagementService.deleteEnrolls Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || `Failed to delete enroll ${enrollmentId}`
            };
        }
    }

    /**
     * Save pre-test
     * @param {Object} pretestData - Pre-test data
     * @returns {Promise} API response
     */
    static async savePreTest(pretestData) {
        try {
            const response = await API.post("/trainer/course/content", pretestData);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Pre-test created successfully'
            };
        } catch (error) {
            console.error('ManagementService.savePreTest Error:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to create pre-test'
            };
        }
    }

    /**
     * Update pre-test
     * @param {Number|String} contentId - Content ID
     * @param {Object} pretestData - Pre-test data
     * @returns {Promise} API response
     */
    static async updatePreTest(contentId, pretestData) {
        try {
            const response = await API.put("/trainer/course/content", pretestData);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Pre-test updated successfully'
            };
        } catch (error) {
            console.error('ManagementService.updatePreTest Error:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to update pre-test'
            };
        }
    }

    /** 
     * Get content by ID
     * @param {number} contentId - Content ID
     * @return {Promise} API response
    */
    static async getContentById(contentId) {
        try {
            const response = await API.get(`/trainer/course/content/${contentId}`); 
            return {
                success: true,
                data: response.data.data || null,
                message: response.data.message || 'Success'
            };
        } catch (error) {
            console.error('ManagementService.getContentById Error:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to fetch content'
            };
        }
    }

    /**
     * Upload file for course content
     * @param {Object} fileData - File data
     * @param {Function} onUploadProgress - Progress callback
     * @returns {Promise} API response  
     */
    static async uploadContentFile(fileData, onUploadProgress) {
        try {
            const formData = new FormData();
            formData.append('File', fileData.file);
            formData.append('FolderType', ManagementService.getFolderTypeByContentType(fileData.contentTypeId));
            formData.append('idCourse', fileData.courseId);
            formData.append('Section', fileData.section);
            
            const response = await API.post("/course/content/upload-file", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    if (onUploadProgress) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onUploadProgress(percentCompleted);
                    }
                }
            });
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'File uploaded successfully'
            };
        } catch (error) {
            console.error('ManagementService.uploadContentFile Error:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to upload file'
            };
        }
    }

    /**
     * Get folder type based on content type
     */
    static getFolderTypeByContentType(contentTypeId) {
        const mapping = {
            '4': 'pdf', 
            '5': 'video', 
            '6': 'doc'     
        };
        return mapping[contentTypeId] || 'other';
    }

    /**
     * Save course enrollment
     * @param {Object} enrollData - Enrollment data
     * @returns {Promise} API response
     */
    static async saveEnrollCourse(enrollData) {
        try {
            const response = await API.post("/trainer/course/enrollment", enrollData);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Enrollment created successfully'
            };
        } catch (error) {
            console.error('ManagementService.saveEnrollCourse Error:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to save enrollment'
            };
        }
    }

    /**
     * Update enrollment
     * @param {Object} enrollData - Enrollment data
     * @returns {Promise} API response
     */
    static async updateEnrollCourse(enrollData) {
        try {
            const response = await API.put("/trainer/course/enrollment/update", enrollData);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Enrollment updated successfully'
            };
        } catch (error) {
            console.error('ManagementService.updateEnrollCourse Error:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to update enrollment'
            };
        }
    }

    

    /**
     * Get all employees with pagination
     * @param {number} page - Page number
     * @param {number} pageSize - Items per page
     * @returns {Promise} API response
     */
    static async getAllEmployees(page = 1, pageSize = 10) {
        try {
            const response = await API.get("/employee", {
                params: {
                    page,
                    limit: pageSize,
                    employment_status: '1'
                }
            });
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Success',
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('ManagementService.getAllEmployees Error:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Failed to fetch employees',
                pagination: null
            };
        }
    }

    /**
     * Assign employees to group
     * @param {Object} assignData - Assignment data
     * @returns {Promise} API response
    */
    static async assignEmployeesToGroup(assignData) {
        try {
            const response = await API.post("/trainer/course/assign-grouping", assignData);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Employees assigned successfully'
            };
        } catch (error) {
            console.error('ManagementService.assignEmployeesToGroup Error:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to assign employees'
            };
        }
    }

    /**
     * Get profile info
     * @returns {Promise} API response
     */
    static async getProfileInfo() {
        try {
            const response = await API.get("/learner/profile");
            return {
                success: true,
                data: response.data.data || null,
                message: response.data.message || 'Success'
            };
        } catch (error) {
            console.error('ManagementService.getProfileInfo Error:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || 'Failed to fetch profile info'
            };
        }
    }

    /**
     * Get company units
     * @returns {Promise} API response
     */
    static async getCompanyUnits() {
        try {
            const response = await API.get("/master/company");
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Success'
            };
        } catch (error) {
            console.error('ManagementService.getCompanyUnits Error:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Failed to fetch company units'
            };
        }
    }

    /**
     * Get enrollments with pagination
     * @param {number} page - Page number
     * @param {number} pageSize - Items per page
     * @returns {Promise} API response
     */
    static async getEnrollments(page = 1, pageSize = 10) {
        try {
            const response = await API.get("/trainer/course/enrollment", {
                params: {
                    page,
                    limit: pageSize
                }
            });
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Success',
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('ManagementService.getEnrollments Error:', error);
            return {
                success: false,
                data: [],
                message: error.response?.data?.message || 'Failed to fetch enrollments',
                pagination: null
            };
        }
    }
}

export default ManagementService;