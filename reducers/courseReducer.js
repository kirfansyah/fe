export const courseReducer = (state, action) => {
  switch (action.type) {
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
