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
      const commpletedCourse = await API.completeContent(courseData);
      return commpletedCourse;
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
      return sendedAnswers;
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
      return sendedEnrollment;
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

      return sendedFeedback;
    } catch (err) {
      //   setError(err.message || "Failed to complete course");
      console.error("Error sendFeedback:", err);
      throw err;
    }
  }, []);
  // send feedback
  const closeSession = useCallback(async (data) => {
    try {
      const closeSession = await API.closeSession(data);

      return closeSession;
    } catch (err) {
      //   setError(err.message || "Failed to complete course");
      console.error("Error closeSession:", err);
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
    closeSession,
  };
}
