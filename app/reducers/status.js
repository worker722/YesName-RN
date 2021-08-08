import { ALERT, DESTROY, HIDEMOREDLG, LOADING, NOTIFICATION, SHOWMOREDLG, TOAST } from "@constants";
const initialState = {
    loading: false,
    text: "",
    alert: {
        title: "",
        message: "",
        isConfirm: true,
        textConfirm: null,
        textCancel: null,
        visible: false,
        onClose: null,
        onResult: null
    },
    toast: {
        message: "",
        visible: false
    },
    more_plus: {
        visible: false
    },
    notification: {}
};

export default (state = initialState, action = {}) => {
    switch (action.type) {
        case LOADING:
            return { ...state, loading: action.data, text: action.text };
        case ALERT:
            return { ...state, alert: { ...action.data, visible: true } };
        case TOAST:
            return { ...state, toast: { ...action.data } };
        case DESTROY:
            return { ...state, ...initialState }
        case SHOWMOREDLG:
            return { ...state, more_plus: { visible: true } }
        case HIDEMOREDLG:
            return { ...state, more_plus: { visible: false } }
        case NOTIFICATION:
            return { ...state, notification: { ...action.data } }
        default:
            return state;
    }
};
