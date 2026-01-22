// services/ReportService.js
import API from "./api";

class ReportService {
  /**
   * Get all Online Learning with pagination & filters
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  static async getAllOnlineLearning(params = {}) {
    try {
      const response = await API.get("/report/online-learning", { params });

      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message || 'Success',
        pagination: response.data.pagination || null
      };
    } catch (error) {
      console.error("ReportService.getAllOnlineLearning Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch online report"
      );
    }
  }

  /**
   * Get all Offline Learning with pagination & filters
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  static async getAllOfflineLearning(params = {}) {
    try {
      const response = await API.get("/report/offline-learning", { params });

      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message || 'Success',
        pagination: response.data.pagination || null
      };
    } catch (error) {
      console.error("ReportService.getAllOfflineLearning Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch offline report"
      );
    }
  }

  /**
   * Create Offline Learning Certificate
   * @param {Object} data - Certificate data
   * @returns {Promise} API response
   */
  static async createOfflineLearning(data) {
    try {
      const formData = new FormData();

      formData.append("employee_id", data.employee_id);
      formData.append("full_name", data.full_name);
      formData.append("position_id", data.position_id);
      formData.append("department_id", data.department_id);
      formData.append("company_id", data.company_id);
      formData.append("training_title", data.training_title);
      formData.append("issuing_organization", data.issuing_organization);
      formData.append("issue_date", data.issue_date);
      formData.append("expiration_date", data.expiration_date);
      formData.append("credential_id", data.credential_id);
      formData.append("credential_url", data.credential_url);
      formData.append("created_by", data.created_by);
      formData.append("created_device", data.created_device);
      
      if (data.certificate) {
        formData.append("certificate", data.certificate);
      }

      const response = await API.post("/report/offline-learning", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message || 'Certificate created successfully'
      };
    } catch (error) {
      console.error("ReportService.createOfflineLearning Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create certificate"
      );
    }
  }

  /**
   * Update Offline Learning Certificate
   * @param {number} id - Certificate ID
   * @param {Object} data - Certificate data
   * @returns {Promise} API response
   */
  static async updateOfflineLearning(id, data) {
    try {
      const formData = new FormData();

      formData.append("id_training_certificate", data.id_training_certificate);
      formData.append("employee_id", data.employee_id);
      formData.append("full_name", data.full_name);
      formData.append("position_id", data.position_id);
      formData.append("department_id", data.department_id);
      formData.append("company_id", data.company_id);
      formData.append("training_title", data.training_title);
      formData.append("issuing_organization", data.issuing_organization);
      formData.append("issue_date", data.issue_date);
      formData.append("expiration_date", data.expiration_date);
      formData.append("credential_id", data.credential_id);
      formData.append("credential_url", data.credential_url);
      formData.append("updated_by", data.updated_by);
      formData.append("updated_device", data.updated_device);

      // Only append file if new file exists
      if (data.certificate && typeof data.certificate !== "string") {
        formData.append("certificate", data.certificate);
      }

      const response = await API.put(
        `/report/offline-learning/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message || 'Certificate updated successfully'
      };
    } catch (error) {
      console.error("ReportService.updateOfflineLearning Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update certificate"
      );
    }
  }

  /**
   * Delete Offline Learning Certificate
   * @param {number} id - Certificate ID
   * @returns {Promise} API response
   */
  static async deleteOfflineLearning(payload) {
    try {
      const response = await API.delete("/report/offline-learning/delete", {
        data: payload
      });

      return {
        success: response.data.success,
        message: response.data.message || 'Certificate deleted successfully'
      };
    } catch (error) {
      console.error("ReportService.deleteOfflineLearning Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete certificate"
      );
    }
  }

  /**
   * Get all Departments
   * @returns {Promise} API response
   */
  static async getAllDept() {
    try {
      const response = await API.get("/master/dept");
      
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message || 'Success',
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error("ReportService.getAllDept Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch department"
      );
    }
  }

  /**
   * Get all Positions
   * @returns {Promise} API response
   */
  static async getAllPosition() {
    try {
      const response = await API.get("/master/position");
      
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message || 'Success',
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error("ReportService.getAllPosition Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch position"
      );
    }
  }

  /**
   * Get all Companies
   * @returns {Promise} API response
   */
  static async getAllCompany() {
    try {
      const response = await API.get("/master/company");
      
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message || 'Success',
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error("ReportService.getAllCompany Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch company unit"
      );
    }
  }

  /**
   * Get Employee by Company ID and Employee ID
   * @param {string} companyId - Company ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise} API response
   */
  static async getEmployee(companyId, employeeId) {
    try {
      const response = await API.get("/employee/source", {
        params: {
          site_id: companyId,
          nik: employeeId
        }
      });

      return {
        success: response.data.success,
        data: response.data.data || null,
        message: response.data.message || 'Success',
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error("ReportService.getEmployee Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch employee"
      );
    }
  }
}

export default ReportService;