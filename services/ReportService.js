import API from "contexts/api";

class ReportService {
  /**
   * Get all ebook
   * @returns {Promise} API response
   */

  static async getAllOnlineLearning() {
    try {
      const response = await API.get("/report/online-learning");

      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("ReportService.getAllOnlineLearning Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch online report"
      );
    }
  }

  static async getAllOfflineLearning() {
    try {
      const response = await API.get("/report/offline-learning");

      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("ReportService.getAllOfflineLearning Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch offline report"
      );
    }
  }

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
      formData.append("issue_date", data.issue_date); // format harus YYYY-MM-DD
      formData.append("expiration_date", data.expiration_date); // format harus YYYY-MM-DD
      formData.append("credential_id", data.credential_id);
      formData.append("credential_url", data.credential_url);
      formData.append("created_by", data.created_by);
      formData.append("created_device", data.created_device);
      if (data.certificate) {
        formData.append("certificate", data.certificate);
      }

      const response = await API.post("/report/offline-learning", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      console.error("createOfflineLearning Error:", error);
      throw error;
    }
  }

  static async getAllDept() {
    try {
      const response = await API.get("/master/dept");
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("ReportService.getAllDept Error:", error);

      //   Cek apakah token ada
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("⚠️ No token found in localStorage");
      }

      throw new Error(
        error.response?.data?.message || "Failed to fetch department"
      );
    }
  }

  static async getAllPosition() {
    try {
      const response = await API.get("/master/position");
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("ReportService.getAllPosition Error:", error);

      //   Cek apakah token ada
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("⚠️ No token found in localStorage");
      }

      throw new Error(
        error.response?.data?.message || "Failed to fetch position"
      );
    }
  }

  static async getAllCompany() {
    try {
      const response = await API.get("/master/company");
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("ReportService.getAllCompany Error:", error);

      //   Cek apakah token ada
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("⚠️ No token found in localStorage");
      }

      throw new Error(
        error.response?.data?.message || "Failed to fetch company unit"
      );
    }
  }
}
export default ReportService;
