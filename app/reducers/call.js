import { FORCECLOSE, NEWCALL } from "@constants";
const initialState = {
    caller_stream: null,
    force_close: false,
};

export default (state = initialState, action = {}) => {
    switch (action.type) {
        case NEWCALL:
            return { ...state, caller_stream: action.data };
        case FORCECLOSE:
            return { ...state, force_close: action.data };
        default:
            return state;
    }
};
