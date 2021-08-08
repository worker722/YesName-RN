import {
    ADDTOFAVOURITE, CHAGNESTORY, GETGALLERY_FAILED, GETGALLERY_SUCCESS, GETMYSTORY_FAILED, GETMYSTORY_SUCCESS, GETSTORIES_FAILED, GETSTORIES_SUCCESS, GETVISITEDMYSTORY, INITSTORES, REMOVEFROMFAVOURITE, HIDEREACTION
} from "@constants";
import { compareDate } from "@utils";

const initialState = {
    stories: [],
    visited_stories: [],//{userid, storyid, visite_num, visited}
    mystory: {
        story: [],
        gallery: [],
        visited: []
    },
    favourite: [],
    gallery: [],
    hideReaction: []
};


export default (state = initialState, action = {}) => {
    let { visited_stories } = state;
    switch (action.type) {
        case INITSTORES:
            return { ...state, stories: [] };
        case GETSTORIES_SUCCESS:
            const compareStories = (d1, d2) => {
                const d1_visited = visited_stories?.find(item => item.storyid == d1.storyid)?.visited;
                const d2_visited = visited_stories?.find(item => item.storyid == d2.storyid)?.visited;
                if (d1_visited != d2_visited) return 1;
                return compareDate(d1.story_date, d2.story_date, false)
            }
            let stories = action.data.sort(compareStories);

            return { ...state, stories };
        case GETSTORIES_FAILED:
            return { ...state, stories: [] };

        case GETMYSTORY_SUCCESS:
            return { ...state, mystory: { ...state.mystory, story: action.data.story, gallery: action.data.gallery } };
        case GETMYSTORY_FAILED:
            return { ...state, mystory: { ...state.mystory, story: [], gallery: [] } };

        case GETGALLERY_SUCCESS:
            return { ...state, gallery: action.data };
        case GETGALLERY_FAILED:
            return { ...state, gallery: [] };

        case ADDTOFAVOURITE:
            return { ...state, favourite: [...state.favourite, action.data] };
        case REMOVEFROMFAVOURITE:
            let fav_gallery = state.favourite?.filter(fav => fav != action.data);
            return { ...state, favourite: [...fav_gallery] };
        case CHAGNESTORY:
            return { ...state, visited_stories: action.data };
        case GETVISITEDMYSTORY:
            return { ...state, mystory: { ...state.mystory, visited: action.data } };
        case HIDEREACTION:
            return { ...state, hideReaction: [...state.hideReaction, action.data] };
        default:
            return state;
    }
};
