import API from "./api";

class RoleService {
  /**
   * Get all roles
   * @returns {Promise} API response
   */
  static async getAllRoles() {
    try {
      const response = await API.get("/roles");
      return {
        success: true, // ✅ Always true di try block
        data: response.data.data || [],
        message: response.data.message || "Success",
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("RoleService.getAllRoles Error:", error);
      return {
        success: false, // ✅ Return error state
        data: [],
        message: error.response?.data?.message || "Failed to fetch roles",
        pagination: null,
      };
    }
  }

  /**
   * Get role by ID
   * @param {number} roleId - Role ID
   * @return {Promise} API response
   */
  static async getRoleById(roleId) {
    try {
      const response = await API.get(`/roles/${roleId}/menus`);
      return {
        success: true,
        data: response.data.data || null,
        message: response.data.message || "Success",
      };
    } catch (error) {
      console.error("RoleService.getRoleById Error:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to fetch role by ID",
      };
    }
  }

  /**
   * Create new roles
   * @param {Object} rolesData - Role data
   * @returns {Promise} API response
   */
  static async createRoles(rolesData) {
    try {
      const response = await API.post("/roles", rolesData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Role created successfully",
      };
    } catch (error) {
      console.error("RoleService.createRoles Error:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to create role",
      };
    }
  }

  /**
   * Update existing role
   * @param {Object} rolesData - Role data
   * @returns {Promise} API response
   */
  static async updateRoles(rolesData) {
    try {
      const response = await API.put("/roles/update", rolesData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Role updated successfully",
      };
    } catch (error) {
      console.error("RoleService.updateRoles Error:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to update role",
      };
    }
  }

  /**
   * Update role config/menus
   * @param {Object} rolesData - Role config data
   * @returns {Promise} API response
   */
  static async updateRolesConfig(rolesData) {
    try {
      const response = await API.put("/roles/menus/update", rolesData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Role config updated successfully",
      };
    } catch (error) {
      console.error("RoleService.updateRolesConfig Error:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to update role config",
      };
    }
  }

  /**
   * Get all menus
   * @returns {Promise} API response
   */
  static async getAllMenus() {
    try {
      const response = await API.get("/menus");
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || "Success",
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("RoleService.getAllMenus Error:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch menus",
        pagination: null,
      };
    }
  }

  /**
   * Create new menu
   * @param {Object} menusData - Menu data
   * @returns {Promise} API response
   */
  static async createMenus(menusData) {
    try {
      const response = await API.post("/menus", menusData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Menu created successfully",
      };
    } catch (error) {
      console.error("RoleService.createMenus Error:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to create menu",
      };
    }
  }

  /**
   * Update existing role
   * @param {Object} rolesData - Role data
   * @returns {Promise} API response
   */
  static async updateMenus(menusData) {
    try {
      const response = await API.put("/menus/update", menusData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Role updated successfully",
      };
    } catch (error) {
      console.error("RoleService.updateMenus Error:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to update role",
      };
    }
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @returns {Promise} API response
   */
  static async createCategory(categoryData) {
    try {
      const response = await API.post("/master/ebook/category", categoryData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Category created successfully",
      };
    } catch (error) {
      console.error("RoleService.createCategory Error:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to create category",
      };
    }
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @returns {Promise} API response
   */
  static async updateCategory(categoryData) {
    try {
      const response = await API.put(
        "/master/ebook/category/update",
        categoryData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Category updated successfully",
      };
    } catch (error) {
      console.error("RoleService.updateCategory Error:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to update category",
      };
    }
  }

  /**
   * Create new subcategory
   * @param {Object} subCategoryData - Subcategory data
   * @returns {Promise} API response
   */
  static async createSubCategory(subCategoryData) {
    try {
      const response = await API.post(
        "/master/ebook/subcategory",
        subCategoryData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Subcategory created successfully",
      };
    } catch (error) {
      console.error("RoleService.createSubCategory Error:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to create subcategory",
      };
    }
  }

  /**
   * Create new subcategory
   * @param {Object} subCategoryData - Subcategory data
   * @returns {Promise} API response
   */
  static async updateSubCategory(subCategoryData) {
    try {
      const response = await API.put(
        "/master/ebook/subcategory/update",
        subCategoryData
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Subcategory updated successfully",
      };
    } catch (error) {
      console.error("RoleService.updateSubCategory Error:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to update subcategory",
      };
    }
  }

  /**
   * Update existing role
   * @param {Object} userData - User data
   * @returns {Promise} API response
   */
  static async updateUsers(userData) {
    try {
      const response = await API.put("/user/roles/update", userData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Role User updated successfully",
      };
    } catch (error) {
      console.error("RoleService.updateUsers Error:", error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || "Failed to update role user",
      };
    }
  }

  /**
   * Dashboard Analytics
   * @param {Object} filters - Filter parameters
   * @returns {Promise} API response
   */
  static async getAnalytics(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.year) queryParams.append("year", filters.year);
      if (filters.month) queryParams.append("month", filters.month);
      if (filters.company_id)
        queryParams.append("company_id", filters.company_id);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/dashboard/analytics?${queryString}`
        : "/dashboard/analytics";

      const response = await API.get(endpoint);
      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || "Success",
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("RoleService.getAnalytics Error:", error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || "Failed to fetch analytics",
        pagination: null,
      };
    }
  }

  /**
   * Dashboard Analytics
   * @param {Object} filters - Filter parameters
   * @returns {Promise} API response
   */
  static async getOverallPassPercentage(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.year) queryParams.append("year", filters.year);
      if (filters.month) queryParams.append("month", filters.month);
      if (filters.company_id)
        queryParams.append("company_id", filters.company_id);
      if (filters.id_course) queryParams.append("id_course", filters.id_course);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/dashboard/courses/pass-statistics?${queryString}`
        : "/dashboard/courses/pass-statistics";

      const response = await API.get(endpoint);
      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || "Success",
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("RoleService.getOverallPassPercentage Error:", error);
      return {
        success: false,
        data: {},
        message:
          error.response?.data?.message ||
          "Failed to fetch overall pass percentage",
        pagination: null,
      };
    }
  }

  /**
   * Dashboard Analytics
   * @param {Object} filters - Filter parameters
   * @returns {Promise} API response
   */
  static async getEmployeeCourseResult(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.year) queryParams.append("year", filters.year);
      if (filters.month) queryParams.append("month", filters.month);
      if (filters.company_id)
        queryParams.append("company_id", filters.company_id);
      if (filters.id_course) queryParams.append("id_course", filters.id_course);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/dashboard/employee/courses-result?${queryString}`
        : "/dashboard/employee/courses-result";

      const response = await API.get(endpoint);
      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || "Success",
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("RoleService.getEmployeeCourseResult Error:", error);
      return {
        success: false,
        data: {},
        message:
          error.response?.data?.message ||
          "Failed to fetch employee course result",
        pagination: null,
      };
    }
  }

  /**
   * Dashboard Analytics
   * @param {Object} filters - Filter parameters
   * @returns {Promise} API response
   */
  static async getCalenderHome(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.year) queryParams.append("year", filters.year);
      if (filters.month) queryParams.append("month", filters.month);
      if (filters.company_id)
        queryParams.append("company_id", filters.company_id);

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/calender?${queryString}` : "/calender";

      const response = await API.get(endpoint);
      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || "Success",
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("RoleService.getCalenderHome Error:", error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || "Failed to fetch calender",
        pagination: null,
      };
    }
  }

  /**
   * Dashboard Schedule
   * @returns {Promise} API response
   */
  static async getSchedule() {
    try {
      const response = await API.get("/scheduled/training");
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || "Success",
      };
    } catch (error) {
      console.error("RoleService.getSchedule Error:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch schedule",
      };
    }
  }

  /**
   * Dashboard Schedule
   * @returns {Promise} API response
   */
  static async getNotification() {
    try {
      const response = await API.get("/dashboard/notifications");
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || "Success",
      };
    } catch (error) {
      console.error("RoleService.getNotification Error:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch notification",
      };
    }
  }

  /**
   * Dashboard Schedule
   * @returns {Promise} API response
   */
  static async updateNotification() {
    try {
      const response = await API.post("/dashboard/notifications/read");
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || "Success",
      };
    } catch (error) {
      console.error("RoleService.updateNotification Error:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to update notification",
      };
    }
  }
}

export default RoleService;
