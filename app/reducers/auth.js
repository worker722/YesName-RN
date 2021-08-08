import { LOGIN } from "@constants";
const initialState = {
    user: {

    }
};

export default (state = initialState, action = {}) => {
    switch (action.type) {
        case LOGIN:
            return { ...action.data };
        default:
            return state;
    }
};
