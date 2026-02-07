import apiEbookEmployee from "./api";

class EbookServiceEmployee {
  /**
   * Get all ebook for employee
   * @returns {Promise} API response
   */
  static async getAllEbook() {
    try {
      const response = await apiEbookEmployee.get("/learner/ebook");
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("EbookServiceEmployee.getAllEbook Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch ebooks",
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
      const response = await apiEbookEmployee.get(`/learner/ebook/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EbookServiceEmployee.getEbookById Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch ebook detail",
      );
    }
  }

  /**
   * Open/Start reading ebook - Create reading log
   * @param {Object} payload - Reading log data
   * @returns {Promise} API response with log ID
   */
  static async openEbook(payload) {
    try {
      const response = await apiEbookEmployee.post(
        "/learner/ebook/reading/open",
        payload,
      );
      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        id_log: response.data.data?.id_log || response.data.id_log,
        message: response.data.message || "Ebook opened successfully",
      };
    } catch (error) {
      console.error("EbookServiceEmployee.openEbook Error:", error);
      throw new Error(
        error.response?.data?.message ||
          `Failed to start reading log: ${error.message}`,
      );
    }
  }

  /**
   * Update reading progress (PATCH method)
   * @param {Object} payload - Progress update data
   * @returns {Promise} API response
   */
  static async updateProgress(payload) {
    try {
      const response = await apiEbookEmployee.patch(
        "/learner/ebook/reading/update",
        payload,
      );

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || "Progress updated successfully",
      };
    } catch (error) {
      console.error("EbookServiceEmployee.updateProgress Error:", error);
      throw new Error(
        error.response?.data?.message ||
          `Failed to update reading progress: ${error.message}`,
      );
    }
  }

  /**
   * Update reading progress (PATCH method)
   * @param {Object} payload - Progress update data
   * @returns {Promise} API response
   */
  static async completeReading(payload) {
    try {
      const response = await apiEbookEmployee.post(
        "/learner/ebook/reading/close",
        payload,
      );

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || "Progress complete successfully",
      };
    } catch (error) {
      console.error("EbookServiceEmployee.completeReading Error:", error);
      throw new Error(
        error.response?.data?.message ||
          `Failed to complete reading progress: ${error.message}`,
      );
    }
  }

  /**
   * Get reading progress for specific ebook (check if user has reading history)
   * @param {number} ebookId - Ebook ID
   * @returns {Promise} API response with last_page and id_log
   */
  static async getReadingProgress(ebookId) {
    try {
      const response = await apiEbookEmployee.get(`/learner/ebook/${ebookId}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      // If 404, user hasn't read this ebook yet
      if (error.response?.status === 404) {
        return {
          success: false,
          data: null,
          message: "No reading progress found",
        };
      }
      console.error("EbookServiceEmployee.getReadingProgress Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch reading progress",
      );
    }
  }

  /**
   * Get reading history for current user
   * @returns {Promise} API response
   */
  static async getReadingHistory() {
    try {
      const response = await apiEbookEmployee.get(
        "/learner/ebook/reading/history",
      );

      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error("EbookServiceEmployee.getReadingHistory Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch reading history",
      );
    }
  }

  /**
   * Submit ebook review/feedback
   * @param {Object} payload - Review data
   * @param {number} payload.id_ebook - Ebook ID
   * @param {number} payload.rating - Rating (1-10)
   * @param {string} payload.comment - Review comment
   * @param {string} payload.created_by - User ID or name
   * @param {string} payload.created_device - Device info
   * @returns {Promise} API response
   */
  static async submitReview(payload) {
    try {
      const response = await apiEbookEmployee.post(
        "/learner/ebook/review",
        payload,
      );

      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || "Review submitted successfully",
      };
    } catch (error) {
      console.error("EbookServiceEmployee.submitReview Error:", error);
      throw new Error(
        error.response?.data?.message ||
          `Failed to submit review: ${error.message}`,
      );
    }
  }

  /**
   * Get reviews for specific ebook
   * @param {number} ebookId - Ebook ID
   * @returns {Promise} API response
   */
  static async getEbookReviews(ebookId) {
    try {
      const response = await apiEbookEmployee.get(
        `/learner/ebook/review/${ebookId}`,
      );

      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
      };
    } catch (error) {
      console.error("EbookServiceEmployee.getEbookReviews Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch ebook reviews",
      );
    }
  }

  /**
   * Get ebook detail by ID (for description page)
   * @param {number} id - Ebook ID
   * @returns {Promise} API response
   */
  static async getEbookDetail(id) {
    try {
      const response = await apiEbookEmployee.get(`/learner/ebook/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EbookServiceEmployee.getEbookDetail Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch ebook detail",
      );
    }
  }

  /**
   * Get ebook detail by ID (for description page)
   * @param {number} id - Ebook ID
   * @returns {Promise} API response
   */
  static async getEbookDescription(id) {
    try {
      const response = await apiEbookEmployee.get(`/ebook/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EbookServiceEmployee.getEbookDescription Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch ebook description",
      );
    }
  }
}

export default EbookServiceEmployee;
