// import API from "contexts/api";
import API from "./api";

class CalendarService {
  /**
   * Get all courses
   * @returns {Promise} API response
   */

  static async getSchedule(year, month, company_id) {
    try {
      const response = await API.get(
        `/calender?year=${year}&month=${month}${
          company_id ? `&company_id=${encodeURIComponent(company_id)}` : ""
        }`,
        {
          validateStatus: (status) => status >= 200 && status < 500,
        }
      );

      console.log("✅ CalendarService.getSchedule response.data:", response);
      // jika 404 / tidak ada data
      if (response.status === 404) {
        return {
          success: false,
          data: [],
          message: "No courses found",
          pagination: { totalCount: 0 },
        };
      }
      console.log("CalendarService : ", response);

      return {
        success: response.data.success,
        data: response.data.data || [],
        result: response.data || [],
        message: response.data.message,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error("CalendarService.getAllData Error:", error);

      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to fetch data",
        pagination: { totalCount: 0 },
      };
    }
  }

  static async getHoliday(year) {
    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/ID`
      );
      const data = await response.json();
      const dates = data.map((item) => item.date);
      return {
        success: true,
        data: dates || [],
      };
    } catch (error) {
      console.error("CalendarService.getHoliday Error:", error);

      return {
        success: false,
        data: [],
      };
    }
  }
}
export default CalendarService;
