import API from "./api";

class EbookService {
  /**
   * Get all ebook
   * @returns {Promise} API response
   */

  static async getAllEbook() {
    try {
      const response = await API.get("/ebook");
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("EbookService.getAllEbook Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch ebooks"
      );
    }
  }

  /**
   * Get ebook by ID
   * @param {number} id - Ebook ID
   * @returns {Promise} API response
   */
  static async getEbookById(id) {
    try {
      const response = await API.get(`/ebook/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EbookService.getEbookById Error:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch ebook");
    }
  }

  /**
   * Get ebook detail by ID
   * @param {number} id - Ebook ID
   * @returns {Promise} API response
   */
  static async getEbookDetailById(id) {
    try {
      const response = await API.get(`/ebook/detail/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EbookService.getEbookDetailById Error:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch ebook");
    }
  }

  // Get all Company
  //   static async getAllCompany() {
  //     const response = await API.get("/master/company");
  //     return response;
  //   }

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
      console.error("EbookService.getAllCompany Error:", error);

      //   Cek apakah token ada
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("⚠️ No token found in localStorage");
      }

      throw new Error(
        error.response?.data?.message || "Failed to fetch company"
      );
    }
  }

  static async getAllCategory() {
    try {
      const response = await API.get("/master/ebook/category");
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("EbookService.getAllCategory Error:", error);

      //   Cek apakah token ada
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("⚠️ No token found in localStorage");
      }

      throw new Error(
        error.response?.data?.message || "Failed to fetch category"
      );
    }
  }

  static async getAllSubCategory() {
    try {
      const response = await API.get("/master/ebook/subcategory");
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("EbookService.getAllSubCategory Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch subcategory"
      );
    }
  }

  static async getAllEmployee() {
    try {
      const response = await API.get("/ebook/monitoring");
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("EbookService.getAllEmployee Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch Employee"
      );
    }
  }

  /**
   * Create new ebook
   * @param {Object} ebookData - Ebook data
   * @returns {Promise} API response
   */
  static async createEbook(ebookData) {
    try {
      // Convert to FormData untuk file upload
      const formData = new FormData();

      // Append text fields
      formData.append("title", ebookData.title);
      formData.append("id_category", ebookData.id_category);
      formData.append("id_subcategory", ebookData.id_subcategory);
      formData.append("author", ebookData.author);
      formData.append("description", ebookData.description);
      formData.append("created_by", ebookData.created_by);
      formData.append("created_device", ebookData.created_device);

      // Append files
      if (ebookData.cover_image) {
        formData.append("cover_image", ebookData.cover_image);
      }
      if (ebookData.file_path) {
        formData.append("file_path", ebookData.file_path);
      }

      // Log untuk debugging
      for (let [key, value] of formData.entries()) {
        // console.log(key, value);
      }

      const response = await API.post("/ebook", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EbookService.createEbook Error:", error);
      console.error("Error response:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to create ebook"
      );
    }
  }

  /**
   * Update ebook
   * @param {number} id - Ebook ID
   * @param {Object} ebookData - Ebook data
   * @returns {Promise} API response
   */
  static async updateEbook(id, ebookData) {
    try {
      const formData = new FormData();

      formData.append("company_id", ebookData.company_id);
      formData.append("title", ebookData.title);
      formData.append("id_category", ebookData.id_category);
      formData.append("id_subcategory", ebookData.id_subcategory);
      formData.append("author", ebookData.author);
      formData.append("description", ebookData.description);

      // Hanya append file jika ada file baru
      if (ebookData.cover_image && typeof ebookData.cover_image !== "string") {
        formData.append("cover_image", ebookData.cover_image);
      }
      if (ebookData.file_path && typeof ebookData.file_path !== "string") {
        formData.append("file_path", ebookData.file_path);
      }

      const response = await API.put(`/ebook/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EbookService.updateEbook Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update ebook"
      );
    }
  }

  /**
   * Delete ebook
   * @param {number} id - Ebook ID
   * @returns {Promise} API response
   */
  static async deleteEbook(id) {
    try {
      // DELETE dengan body JSON (sesuai Postman)
      const response = await API.delete("/ebook", {
        data: {
          id_ebook: id,
          deleted_by: "Dadang H",
          deleted_device: "Web",
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      return {
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EbookService.deleteEbook Error:", error);
      console.error("Error response:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Failed to delete ebook"
      );
    }
  }
}
export default EbookService;
