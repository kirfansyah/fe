export const userLanguageReducer = (state, action) => {
    switch (action.type) {
        case 'saveLanguage':
            return { ...state, isLoading:false, isSave:false}
        case 'getLanguage':
            return { ...state, isLoading:false, isSave:false, listData: action.payload, data: [] }
        case 'error':
            return { ...state, message: action.payload, isLoading:false, isSave:false }
        case 'beforeEdit':
            return { ...state, data: state.listData.find(x => x.id == action.payload) }
        case 'showLoading':
            return {...state, isLoading:action.payload, isSave: false}
        case 'showLoadingSave':
            return {...state, isLoading:action.payload, isSave: true }
        default:
            return state;
    }
}