export const profileReducer = (state, action) => {
  switch (action.type) {
    case "loading":
            return { ...state, isLoading: true };
    case 'getKaryawan':
        return { ...state, isLoading: false, dataKaryawan: action.payload };
    case 'getMenu':
        return { ...state, isLoading: false, dataMenu: action.payload };
    default:
      return state
  }
}
