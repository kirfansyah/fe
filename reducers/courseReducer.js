export const courseReducer = (state, action) => {
  switch (action.type) {
    case "SET_COURSE_DATA":
      return { ...state, courseData: action.payload };
    case "SET_FLOW":
      return { ...state, flow: action.payload };
    case "SET_COURSE_ID":
      return { ...state, courseId: action.payload };
    case "SET_COURSE_DATA":
      return {
        ...state,
        courseData: action.payload,
        flow: action.payload.sections || [],
        totalSteps: Object.keys(action.payload.sections || {}).length,
      };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "COMPLETE_STEP": {
      const completed = [...new Set([...state.completed, action.payload])];
      const total = state.totalSteps;
      const progress = (completed.length / total) * 100;
      return { ...state, completed, progress };
    }

    case "NEXT_STEP": {
      const { currentStep, nextStep } = action.payload;
      const completed = [...new Set([...state.completed, currentStep])];
      const total = state.totalSteps;
      const progress = (completed.length / total) * 100;
      return { ...state, currentStep: nextStep, completed, progress };
    }
    case "SET_ANSWER": {
      const { questionId, answer } = action.payload;
      return {
        ...state,
        answers: { ...state.answers, [questionId]: answer },
      };
    }

    default:
      return state;
  }
};
