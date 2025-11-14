import { createContext, useReducer, useMemo, useEffect } from "react";
import { courseReducer } from "@/reducers/courseReducer";
import { courseFlow } from "@/dummy-data/courseFlow";
import { useEmployees } from "@/hooks/useEmployees";

export const CourseContext = createContext();

export default function CourseProvider({ children, courseId }) {
  const { getCourseDetailById } = useEmployees();

  const totalSteps = useMemo(
    () => courseFlow.flatMap((s) => s.children ?? [s]).length,
    []
  );

  const initialState = {
    courseId: courseId || null,
    courseData: null,
    currentStep: 0,
    completed: [],
    progress: 0,
    totalSteps,
    flow: [],
    answers: {},
  };

  const [state, dispatch] = useReducer(courseReducer, initialState);

  const setCourseId = (id) => {
    dispatch({ type: "SET_COURSE_ID", payload: id });
  };

  useEffect(() => {
    const fetchCourse = async () => {
      if (!state.courseId) return;
      if (!state.courseId) {
        console.log("⛔ Gagal fetch: courseId belum ada");
        return;
      }

      try {
        const res = await getCourseDetailById(state.courseId);

        if (res?.data?.data) {
          const courseData = res.data.data;
          const sections = courseData.sections || {};
          const flow = Object.keys(sections);
          dispatch({ type: "SET_COURSE_DATA", payload: courseData });
          dispatch({ type: "SET_FLOW", payload: sections });
        }
      } catch (err) {
        console.error("❌ Gagal memuat data course:", err);
      }
    };

    fetchCourse();
  }, [state.courseId]);

  // ===== Fungsi baru untuk refresh progress dari API =====
  const refreshCourseProgress = async () => {
    try {
      if (!state.courseId) return;
      const res = await getCourseDetailById(state.courseId);
      if (res?.data?.data) {
        const courseData = res.data.data;
        dispatch({ type: "SET_COURSE_DATA", payload: courseData });
        dispatch({ type: "SET_FLOW", payload: courseData.sections || {} });
        dispatch({
          type: "SET_PROGRESS",
          payload: courseData.progress_percentage,
        });
      }
    } catch (err) {
      console.error("❌ Gagal refresh progress:", err);
    }
  };

  const setStep = (stepId) => dispatch({ type: "SET_STEP", payload: stepId });
  const completeStep = (stepId) =>
    dispatch({ type: "COMPLETE_STEP", payload: stepId });
  const goNext = (currentStep, nextStep) =>
    dispatch({ type: "NEXT_STEP", payload: { currentStep, nextStep } });
  const setAnswer = (questionId, answer) =>
    dispatch({ type: "SET_ANSWER", payload: { questionId, answer } });
  const setProgress = (value) =>
    dispatch({ type: "SET_PROGRESS", payload: value });

  const value = useMemo(
    () => ({
      state,
      flow: state.flow, // ⬅️ tambahkan ini
      setCourseId,
      setStep,
      completeStep,
      goNext,
      setAnswer,
      setProgress,
      refreshCourseProgress,
    }),
    [state]
  );

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
}
