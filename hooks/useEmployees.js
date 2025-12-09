import { useState, useEffect, useCallback } from "react";
import API from "../services/EmployeesService";

export function useEmployees() {
  const fetchEmployees = useCallback(
    async (page = 1, limit = 8, search = "", status = "", categories = "") => {
      try {
        const result = await API.getAllData(
          page,
          limit,
          search,
          status,
          categories
        );
        // console.log("useEmployees: ", result);
        // console.log("categories: ", categories);
        return {
          data: result.data || [],
          pagination: result.pagination || 0,
          result: result || [],
        };
      } catch (err) {
        console.error("❌ fetchEmployees error:", err);
        return { data: [], pagination: { totalCount: 0 } };
      }
    },
    []
  );

  const getCourseById = useCallback(async (id) => {
    try {
      const result = await API.getCourseContent(id);

      return {
        data: result,
      };
    } catch (err) {
      console.error("❌ getCourseById error:", err);
      return { data: [] };
    }
  }, []);

  const getCourseDetailById = useCallback(async (id) => {
    try {
      const result = await API.getCourseDetail(id);
      //   console.log("result getCourseById:", result);

      return {
        data: result,
      };
    } catch (err) {
      console.error("❌ getCourseDetailById error:", err);
      return { data: [] };
    }
  }, []);

  //   complete course
  const completeCourse = useCallback(async (courseData) => {
    try {
      const payload = {
        id_user_enrollment: "0",
        id_course_content: "0",
        updated_at: "2025-11-05T02:11:11.453Z",
        updated_by: "system",
        updated_device: "system",
      };

      const commpletedCourse = await API.completeContent(courseData);
      console.log("commpletedCourse :", commpletedCourse);

      return commpletedCourse.data;
    } catch (err) {
      //   setError(err.message || "Failed to complete course");
      console.error("Error complete course:", err);
      throw err;
    }
  }, []);

  //   send answer
  const sendAswers = useCallback(async (answers) => {
    try {
      const sendedAnswers = await API.sendAnswers(answers);
      console.log("sendAswers :", sendedAnswers);

      return sendedAnswers.data;
    } catch (err) {
      //   setError(err.message || "Failed to complete course");
      console.error("Error answers:", err);
      throw err;
    }
  }, []);

  // send answer
  const sendEnrollment = useCallback(async (data) => {
    try {
      const sendedEnrollment = await API.sendEnrollment(data);
      console.log("sendEnrollment :", sendedEnrollment);

      return sendedEnrollment.data;
    } catch (err) {
      //   setError(err.message || "Failed to complete course");
      console.error("Error sendEnrollment:", err);
      throw err;
    }
  }, []);

  // send feedback
  const sendFeedback = useCallback(async (data) => {
    try {
      const sendedFeedback = await API.sendFeedback(data);
      console.log("sendFeedback :", sendedFeedback);

      return sendedFeedback;
    } catch (err) {
      //   setError(err.message || "Failed to complete course");
      console.error("Error sendFeedback:", err);
      throw err;
    }
  }, []);

  return {
    fetchEmployees,
    getCourseById,
    getCourseDetailById,
    completeCourse,
    sendAswers,
    sendEnrollment,
    sendFeedback,
  };
}
