import API from "contexts/api";

class EmployeesService {
  /**
   * Get all courses
   * @returns {Promise} API response
   */

  static async getAllData(page = 1, limit = 8, search = "") {
    try {
      const response = await API.get(
        `/learner/course?page=${page}&limit=${limit}${
          search ? `&search=${encodeURIComponent(search)}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );

      // jika 404 / tidak ada data
      if (response.status === 404 || !response.data.data?.length) {
        return {
          success: false,
          data: [],
          message: "No courses found",
          pagination: { totalCount: 0 },
        };
      }

      return {
        success: response.data.success,
        data: response.data.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("EmployeesService.getAllData Error:", error);

      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch courses",
        pagination: { totalCount: 0 },
      };
    }
  }

  static async getCourseContent(id) {
    try {
      const response = await API.get(`/learner/course/content/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        validateStatus: (status) => status >= 200 && status < 500,
      });

      //   console.log("✅ response.data.data:", response.data?.data);

      const content = response.data?.data;
      // jika 404 / tidak ada data
      if (
        response.status === 404 ||
        !content ||
        Object.keys(content).length === 0
      ) {
        return {
          success: false,
          data: [],
          message: "No data found",
        };
      }

      return {
        success: response.data.success,
        data: content,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EmployeesService.getCourseContent Error:", error);

      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch courses content",
      };
    }
  }

  static async getCourseDetail(id) {
    try {
      const response = await API.get(`/learner/course/content/detail/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        validateStatus: (status) => status >= 200 && status < 500,
      });

      //   console.log("✅ response.data.data:", response.data?.data);

      const content = response.data?.data;
      // jika 404 / tidak ada data
      if (
        response.status === 404 ||
        !content ||
        Object.keys(content).length === 0
      ) {
        return {
          success: false,
          data: [],
          message: "No data found",
        };
      }

      return {
        success: response.data.success,
        data: content,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EmployeesService.getCourseDetail Error:", error);

      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to fetch courses content",
      };
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
        message: response.data.message,
      };
    } catch (error) {
      console.error("ManagementService.createCourse Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create course"
      );
    }
  }
}
export default EmployeesService;
