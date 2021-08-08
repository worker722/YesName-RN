import { GONEXTPAGE, GOSUCCESS, SECURITY, SECURITYBAR } from "@constants";
const initialState = {
    security: false,
    securityBar: false,
    next: {
        page: null,
        params: {}
    },
    pendingpage: false,
};

export default (state = initialState, action = {}) => {
    switch (action.type) {
        case SECURITY:
            return { ...state, security: action.data };
        case SECURITYBAR:
            return { ...state, securityBar: action.data };
        case GONEXTPAGE:
            return { ...state, next: action.data, pendingpage: true };
        case GOSUCCESS:
            return { ...state, pendingpage: false };
        default:
            return state;
    }
};
