export const authReducer = (state, action) => {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "registerSuccess":
      return {
        ...state,
        isLoading: false,
        message: action.data.message,
        isAuthenticated: action.data.status,
        token: action.data.token,
        profil: action.data.profil,
      };
    case "loginSuccess":
      return {
        ...state,
        isLoading: false,
        message: action.data.message,
        isAuthenticated: action.data.status,
        token: action.data.token,
        profil: action.data.profil,
      };
    case "loginFailed":
      return {
        ...state,
        isLoading: false,
        message: action.data.message,
        isAuthenticated: action.data.status,
      };
    case "logout":
      return {
        ...state,
        isLoading: false,
        message: action.data.message,
        isAuthenticated: action.data.status,
        token: action.data.token,
      };
    case "checkAuth":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: action.data.status,
        token: action.data.token,
      };
    case "checkId":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: action.data.status,
        profil: action.data.profile,
      };
    case "checkEmail":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: action.data.status,
        email: action.data.email
      };
    case "changePassword":
      return {
        ...state,
        isLoading: false,
        message: action.data.message,
        isAuthenticated: action.data.status,
      };
      case "forgot":
        return {
          ...state,
          isLoading: false,
          message: action.data.message,
          isAuthenticated: action.data.status,
        };
        case "reset":
          return {
            ...state,
            isLoading: false,
            message: action.data.message,
            isAuthenticated: action.data.status,
          };
    default:
      return state;
  }
};
