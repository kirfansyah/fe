import API from "./api";

class CourseRatingFeedbackService {
  /**
   * Get all ratings with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise} API response
   */
  static async getAllRatings(page = 1, limit = 10) {
    try {
      const response = await API.get("/course/rating", {
        params: { page, limit },
      });

      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("Full Error:", error);

      throw new Error(
        error.response?.data?.message || "Failed to fetch ratings"
      );
    }
  }

  /**
   * Get rating by course ID
   * @param {number} id - Course ID
   * @returns {Promise} API response
   */
  static async getRatingById(id) {
    try {
      const response = await API.get(`/course/rating/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("RatingFeedbackService.getRatingById Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch rating"
      );
    }
  }

  /**
   * Get all feedbacks with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise} API response
   */
  static async getAllFeedbacks(page = 1, limit = 10) {
    try {
      const response = await API.get("/course/feedback", {
        params: { page, limit },
      });
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination || {
          currentPage: page,
          pageSize: limit,
          totalCount: response.data.data?.length || 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };
    } catch (error) {
      console.error("RatingFeedbackService.getAllFeedbacks Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch feedbacks"
      );
    }
  }

  /**
   * Get feedback by ID
   * @param {number} id - Feedback ID
   * @returns {Promise} API response
   */
  static async getFeedbackById(id) {
    try {
      const response = await API.get(`/course/feedback/${id}`);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("RatingFeedbackService.getFeedbackById Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch feedback"
      );
    }
  }

  /**
   * Get feedbacks filtered by course
   * @param {number} courseId - Course ID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise} API response
   */
  static async getFeedbacksByCourse(courseId, page = 1, limit = 10) {
    try {
      const response = await API.get(`/course/feedback/course/${courseId}`, {
        params: { page, limit },
      });
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("RatingFeedbackService.getFeedbacksByCourse Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch feedbacks by course"
      );
    }
  }

  /**
   * Get feedbacks filtered by company ID
   * @param {number} companyId - Company ID
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise} API response
   */
  static async getFeedbacksByCompany(companyId, page = 1, limit = 10) {
    try {
      const response = await API.get(`/course/feedback/company/${companyId}`, {
        params: { page, limit },
      });
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error(
        "RatingFeedbackService.getFeedbacksByCompany Error:",
        error
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch feedbacks by company"
      );
    }
  }

  /**
   * Get feedbacks filtered by date range
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise} API response
   */
  static async getFeedbacksByDateRange(
    startDate,
    endDate,
    page = 1,
    limit = 10
  ) {
    try {
      const response = await API.get("/course/feedback/date-range", {
        params: { startDate, endDate, page, limit },
      });
      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error(
        "RatingFeedbackService.getFeedbacksByDateRange Error:",
        error
      );
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch feedbacks by date range"
      );
    }
  }
}

export default CourseRatingFeedbackService;
