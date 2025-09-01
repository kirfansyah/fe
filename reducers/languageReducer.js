
export const languageReducer = (state, action) => {
    switch (action.type) {
        case 'changeLanguage':
            console.log(action.payload)
            return { ...state, lang: action.payload, listLanguage:action.listLanguage }
        default:
            return state;
    }
}