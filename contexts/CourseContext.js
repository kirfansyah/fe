import { createContext, useReducer, useMemo } from "react";
import { courseReducer } from "@/reducers/courseReducer";
import { courseFlow } from "@/dummy-data/courseFlow";

export const CourseContext = createContext();

export default function CourseProvider({ children }) {
  const totalSteps = useMemo(
    () => courseFlow.flatMap((s) => s.children ?? [s]).length,
    []
  );

  const initialState = {
    currentStep: "guide",
    completed: [],
    progress: 0,
    totalSteps,
    flow: courseFlow,
    answers: {},
  };

  const [state, dispatch] = useReducer(courseReducer, initialState);

  const setStep = (stepId) => dispatch({ type: "SET_STEP", payload: stepId });
  const completeStep = (stepId) =>
    dispatch({ type: "COMPLETE_STEP", payload: stepId });
  const goNext = (currentStep, nextStep) =>
    dispatch({ type: "NEXT_STEP", payload: { currentStep, nextStep } });

  const setAnswer = (questionId, answer) =>
    dispatch({ type: "SET_ANSWER", payload: { questionId, answer } });

  return (
    <CourseContext.Provider
      value={{ state, setStep, completeStep, goNext, setAnswer }}
    >
      {children}
    </CourseContext.Provider>
  );
}
