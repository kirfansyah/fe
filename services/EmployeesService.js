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

  static async completeContent(courseData) {
    try {
      const response = await API.post(
        "/learner/course/content/complete",
        courseData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EmployeesService.completeContent Error:", error);
    }
  }

  static async sendAnswers(answers) {
    try {
      const response = await API.post("/learner/course/assessment", answers, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        validateStatus: (status) => status >= 200 && status < 500,
      });

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EmployeesService.sendAnswers Error:", error);
    }
  }

  static async sendEnrollment(data) {
    try {
      const response = await API.post("/learner/course/enrollment", data, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        validateStatus: (status) => status >= 200 && status < 500,
      });

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EmployeesService.sendEnrollment Error:", error);
    }
  }

  static async sendFeedback(data) {
    try {
      const response = await API.post("/learner/course/review", data, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        validateStatus: (status) => status >= 200 && status < 500,
      });

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EmployeesService.sendFeedback Error:", error);
    }
  }
}
export default EmployeesService;
