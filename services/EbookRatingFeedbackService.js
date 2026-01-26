import API from "./api";

class EbookRatingFeedbackService {
  /**
   * Get all ebook ratings with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise} API response
   */
  static async getAllRatings(page = 1, limit = 10) {
    try {
      const response = await API.get("/ebook/rating", {
        params: { page, limit },
      });

      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch ebook ratings",
      );
    }
  }

  /**
   * Get ebook rating by ID
   * @param {number} id - Ebook ID
   * @returns {Promise} API response
   */
  static async getRatingById(id) {
    try {
      const response = await API.get(`/ebook/rating/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EbookRatingFeedbackService.getRatingById Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch ebook rating",
      );
    }
  }

  /**
   * Get all ebook feedbacks with date filter
   * @param {string} date - Date filter (YYYY-MM-DD format)
   * @returns {Promise} API response
   */
  static async getAllFeedbacks(date = null) {
    try {
      const params = {};
      if (date) {
        params.date = date;
      }

      const response = await API.get("/ebook/feedback", { params });

      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination || {
          currentPage: 1,
          pageSize: response.data.data?.length || 0,
          totalCount: response.data.data?.length || 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch ebook feedbacks",
      );
    }
  }

  /**
   * Get ebook feedback by ID
   * @param {number} id - Feedback ID
   * @returns {Promise} API response
   */
  static async getFeedbackById(id) {
    try {
      const response = await API.get(`/ebook/feedback/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EbookRatingFeedbackService.getFeedbackById Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch ebook feedback",
      );
    }
  }

  /**
   * Get feedbacks filtered by ebook
   * @param {number} ebookId - Ebook ID
   * @param {string} date - Date filter (optional)
   * @returns {Promise} API response
   */
  static async getFeedbacksByEbook(ebookId, date = null) {
    try {
      const params = {};
      if (date) {
        params.date = date;
      }

      const response = await API.get(`/ebook/feedback/ebook/${ebookId}`, {
        params,
      });
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error(
        "EbookRatingFeedbackService.getFeedbacksByEbook Error:",
        error,
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch feedbacks by ebook",
      );
    }
  }

  /**
   * Get feedbacks filtered by company ID
   * @param {number} companyId - Company ID
   * @param {string} date - Date filter (optional)
   * @returns {Promise} API response
   */
  static async getFeedbacksByCompany(companyId, date = null) {
    try {
      const params = {};
      if (date) {
        params.date = date;
      }

      const response = await API.get(`/ebook/feedback/company/${companyId}`, {
        params,
      });
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error(
        "EbookRatingFeedbackService.getFeedbacksByCompany Error:",
        error,
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch feedbacks by company",
      );
    }
  }

  /**
   * Get feedbacks filtered by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} API response
   */
  static async getFeedbacksByDateRange(startDate, endDate) {
    try {
      const response = await API.get("/ebook/feedback/date-range", {
        params: { startDate, endDate },
      });
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error(
        "EbookRatingFeedbackService.getFeedbacksByDateRange Error:",
        error,
      );
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch feedbacks by date range",
      );
    }
  }
}

export default EbookRatingFeedbackService;
