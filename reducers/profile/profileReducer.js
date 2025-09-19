export const profileReducer = (state, action) => {
  switch (action.type) {
    case "loading":
            return { ...state, isLoading: true };
    case 'getKaryawan':
        return { ...state, isLoading: false, dataKaryawan: action.payload };
    default:
      return state
  }
}
