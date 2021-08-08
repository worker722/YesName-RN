import {
    GETCONTACTSFAILED, GETCONTACTSSUCCESS, GETSTATEFAILED, GETSTATESUCCESS, GETUSERFAILED, GETUSERSUCCESS, INITSTORES
} from "@constants";
const initialState = {
    users: [],
    contacts: [],
    userState: [],
};

export default (state = initialState, action = {}) => {
    switch (action.type) {
        case INITSTORES:
            return { ...initialState };
        // users
        case GETUSERSUCCESS:
            return { ...state, users: action.data };
        case GETUSERFAILED:
            return { ...state, users: [] };

        // contacts
        case GETCONTACTSSUCCESS:
            return { ...state, contacts: action.data };
        case GETCONTACTSFAILED:
            return { ...state, contacts: [] };

        // contacts
        case GETSTATESUCCESS:
            return { ...state, userState: action.data };
        case GETSTATEFAILED:
            return { ...state, userState: [] };
        default:
            return state;
    }
};
