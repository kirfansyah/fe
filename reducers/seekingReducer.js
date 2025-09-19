export const seekingReducer = (state, action) => {
    switch (action.type) {
        case 'showModal':
            return {...state, isModal: action.payload, searchText: ''};
        case 'showList':
            return {...state, isShow: action.payload, searchText: action.text};
        case 'showLoading':
            return {...state, isLoading:action.payload };
        case 'getSeeking':
            return { ...state, isLoading: false, listData: action.payload }
        default:
            return state;
    }
}