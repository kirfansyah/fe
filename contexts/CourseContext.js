// import { createContext, useReducer, useMemo, useEffect } from "react";
// import { courseReducer } from "@/reducers/courseReducer";
// import { courseFlow } from "@/dummy-data/courseFlow";
// import { useEmployees } from "@/hooks/useEmployees"; // ✅ Import API Hook

// export const CourseContext = createContext();

// export default function CourseProvider({ children }) {
//   const { getCourseDetailById } = useEmployees();
//   const initialState = {
//     currentStep: "guide",
//     completed: [],
//     progress: 0,
//     totalSteps,
//     flow: courseFlow,
//     answers: {},
//   };
//   const [state, dispatch] = useReducer(courseReducer, initialState);
//   // ✅ Set ID Course
//   const setCourseId = (id) => dispatch({ type: "SET_COURSE_ID", payload: id });
//   useEffect(() => {
//     const fetchCourse = async () => {
//       const res = await getCourseDetailById(id);
//     };
//   }, [fetchCourse]);

//   console.log("context : ", fetchCourse);

//   const totalSteps = useMemo(
//     () => courseFlow.flatMap((s) => s.children ?? [s]).length,
//     []
//   );

//   const setStep = (stepId) => dispatch({ type: "SET_STEP", payload: stepId });
//   const completeStep = (stepId) =>
//     dispatch({ type: "COMPLETE_STEP", payload: stepId });
//   const goNext = (currentStep, nextStep) =>
//     dispatch({ type: "NEXT_STEP", payload: { currentStep, nextStep } });

//   const setAnswer = (questionId, answer) =>
//     dispatch({ type: "SET_ANSWER", payload: { questionId, answer } });

//   return (
//     <CourseContext.Provider
//       value={{ state, setCourseId, setStep, completeStep, goNext, setAnswer }}
//     >
//       {children}
//     </CourseContext.Provider>
//   );
// }

import { createContext, useReducer, useMemo, useEffect } from "react";
import { courseReducer } from "@/reducers/courseReducer";
import { courseFlow } from "@/dummy-data/courseFlow";
import { useEmployees } from "@/hooks/useEmployees"; // ✅ Import API Hook

export const CourseContext = createContext();

export default function CourseProvider({ children }) {
  const { getCourseDetailById } = useEmployees();

  // ✅ Hitung totalSteps dulu
  const totalSteps = useMemo(
    () => courseFlow.flatMap((s) => s.children ?? [s]).length,
    []
  );

  // ✅ Definisikan initialState sebelum useReducer
  const initialState = {
    courseId: null,
    courseData: null,
    currentStep: "guide",
    completed: [],
    progress: 0,
    totalSteps,
    flow: [],
    answers: {},
  };

  const [state, dispatch] = useReducer(courseReducer, initialState);

  // ✅ Setter untuk ID course
  const setCourseId = (id) => {
    dispatch({ type: "SET_COURSE_ID", payload: id });
  };

  // ✅ Ambil data dari API saat courseId berubah
  useEffect(() => {
    const fetchCourse = async () => {
      if (!state.courseId) return;
      try {
        const res = await getCourseDetailById(state.courseId);
        console.log("res :", res);

        if (res?.data?.data) {
          const courseData = res.data.data;

          // 🔹 ambil semua key parent dari sections (misal: ["courseGuide", "courseOutline", ...])
          const sections = courseData.sections || {};
          const flow = Object.keys(sections);

          // 🔹 update state courseData dan flow sekaligus
          dispatch({ type: "SET_COURSE_DATA", payload: courseData });
          //   dispatch({ type: "SET_FLOW", payload: flow });
          dispatch({ type: "SET_FLOW", payload: sections });
        }
      } catch (err) {
        console.error("❌ Gagal memuat data course:", err);
      }
    };

    fetchCourse();
  }, [state.courseId]); // ⬅️ jalan setiap ID berubah

  // ✅ Aksi reducer lain
  const setStep = (stepId) => dispatch({ type: "SET_STEP", payload: stepId });
  const completeStep = (stepId) =>
    dispatch({ type: "COMPLETE_STEP", payload: stepId });
  const goNext = (currentStep, nextStep) =>
    dispatch({ type: "NEXT_STEP", payload: { currentStep, nextStep } });
  const setAnswer = (questionId, answer) =>
    dispatch({ type: "SET_ANSWER", payload: { questionId, answer } });

  return (
    <CourseContext.Provider
      value={{
        state,
        flow: state.flow, // ⬅️ tambahkan ini
        setCourseId,
        setStep,
        completeStep,
        goNext,
        setAnswer,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}
