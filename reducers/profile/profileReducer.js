export const profileReducer = (state, action) => {
  switch (action.type) {
    case "setInput":
      return { ...state, isInput: action.payload, isLoading:true }
    case "setShowForm":
      return { ...state, showForm: action.showForm }
    case "setDataWorkExperience":
      return { ...state, dataWorkExperience: action.data }
    case "setDataOrganization":
      return { ...state, dataOrganization: action.data }
    case "setDataSkills":
      return { ...state, dataSkills: action.data }
    case "setdegree":
      return {...state, dataDegrees: action.payload}
    case "setInstitution":
      return {...state, dataInstituion: action.payload}
      case "setInstitutionSearch":
        return {...state, dataInstituionSearch: action.payload}
    case "setMajor" :
      return {...state, dataMajor: action.payload}
    case "setMajorSearch" :
      return {...state, dataMajorSearch: action.payload}
    default:
      return state
  }
}
