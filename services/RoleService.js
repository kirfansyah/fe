import API from './api';

class RoleService {
    /**
     * Get all roles
     * @returns {Promise} API response
     */

    static async getAllRoles() {
        try {
            const response = await API.get("/roles");
            return {
                success: response.data.success,
                data: response.data.data || [],
                message: response.data.message,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('RoleService.getAllRoles Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch roles');
        }
    }

    /** 
     * Get role by ID
     * @param {number} roleId - Content ID
     * @return {Promise} API response
    */
    static async getRoleById(roleId) {
        try {
            const response = await API.get(`/roles/${roleId}/menus`); 
            return {
                success: response.data.success,
                data: response.data.data || null,
                message: response.data.message
            };
        } catch (error) {
            console.error('RoleService.getRoleById Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch role by ID');
        }
    }

    /**
     * Create new roles
     * @param {Object} rolesData - Course data
     * @returns {Promise} API response
     */
    static async createRoles(rolesData) {
        try {
            const response = await API.post("roles", rolesData);
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('RoleService.createRoles Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to create roles');
        }
    }

    /**
     * Update existing course content
     * @param {Object} rolesData - Course content data
     * @returns {Promise} API response
     */
    static async updateRoles(rolesData) {
        try {
            const response = await API.put("roles/update", rolesData);
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('RoleService.updateRoles Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to update roles');
        }
    }

    /**
     * Update existing course content
     * @param {Object} rolesData - Course content data
     * @returns {Promise} API response
     */
    static async updateRolesConfig(rolesData) {
        try {
            const response = await API.put("roles/menus/update", rolesData);
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('RoleService.updateRoles Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to update roles');
        }
    }

     /**
     * Get all menu
     * @returns {Promise} API response
     */

    static async getAllMenus() {
        try {
            const response = await API.get("/menus");
            return {
                success: response.data.success,
                data: response.data.data || [],
                message: response.data.message,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('RoleService.getAllMenus Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch courses');
        }
    }

    /**
     * Create new menus
     * @param {Object} menusData - Course data
     * @returns {Promise} API response
     */
    static async createMenus(menusData) {
        try {
            const response = await API.post("menus", menusData);
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('RoleService.createMenus Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to create roles');
        }
    }

    /**
     * Dashboard Analytics
     */
    static async getAnalytics(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (filters.year) {
                queryParams.append('year', filters.year);
            }
            if (filters.month) {
                queryParams.append('month', filters.month);
            }
            if (filters.company_id) {
                queryParams.append('company_id', filters.company_id);
            }

            const queryString = queryParams.toString();
            const endpoint = queryString 
                ? `/dashboard/analytics?${queryString}` 
                : '/dashboard/analytics';
            const response = await API.get(endpoint);
            return {
                success: response.data.success,
                data: response.data.data || [],
                message: response.data.message,
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('RoleService.getAllMenus Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch courses');
        }
    }

    /**
     * Create new roles
     * @param {Object} categoryData - Course data
     * @returns {Promise} API response
     */
    static async createCategory(categoryData) {
        try {
            const response = await API.post("master/ebook/category", categoryData);
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('RoleService.createCategory Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to create category');
        }
    }

    /**
     * Create new roles
     * @param {Object} subCategoryData - Course data
     * @returns {Promise} API response
     */
    static async createSubCategory(subCategoryData) {
        try {
            const response = await API.post("master/ebook/subcategory", subCategoryData);
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('RoleService.createSubCategory Error:', error);
            throw new Error(error.response?.data?.message || 'Failed to create subcategory');
        }
    }
    



}
export default RoleService;