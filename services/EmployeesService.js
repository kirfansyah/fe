// import API from "contexts/api";
import API from "./api";
// console.log("API is:", API);

class EmployeesService {
  /**
   * Get all courses
   * @returns {Promise} API response
   */

  static async getAllData(
    page = 0,
    limit = 8,
    search = "",
    status = "",
    categories = ""
  ) {
    // console.log("test");
    const fixedCategories = categories === "All" ? "" : categories;
    try {
      const response = await API.get(
        `/learner/course?page=${page}&limit=${limit}${
          search ? `&search=${encodeURIComponent(search)}` : ""
        }${status ? `&status=${encodeURIComponent(status)}` : ""}${
          fixedCategories
            ? `&categories=${encodeURIComponent(fixedCategories)}`
            : ""
        }`,
        {
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );

      //   console.log("✅ EmployeesService.getAllData response.data:", response);
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
        result: response.data || [],
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
        validateStatus: (status) => status >= 200 && status <= 500,
      });

      //   console.log("✅ response:", response);

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
          message: response.data?.message,
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
        validateStatus: (status) => status >= 200 && status < 500,
      });
      //   console.log("✅ response:", response);

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
          validateStatus: (status) => status >= 200 && status <= 500,
        }
      );
      //   console.log("completeContent: ", response);

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
        validateStatus: (status) => status >= 200 && status <= 500,
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
        validateStatus: (status) => status >= 200 && status <= 500,
      });

      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error("EmployeesService.sendEnrollment Error:", error);
      return error?.message;
      //   throw error;
    }
  }

  static async sendFeedback(data) {
    try {
      const response = await API.post("/learner/course/review", data, {
        validateStatus: (status) => status >= 200 && status <= 500,
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
