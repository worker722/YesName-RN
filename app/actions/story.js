import { ApiActions, SocketManager } from "@actions";
import { BaseConfig, Sockets } from "@config";
import {
    ADDTOFAVOURITE, CHAGNESTORY, GETGALLERY_FAILED, GETGALLERY_SUCCESS, GETMYSTORY_FAILED, GETMYSTORY_SUCCESS, GETSTORIES_FAILED, GETSTORIES_SUCCESS, GETVISITEDMYSTORY, LOADING, REMOVEFROMFAVOURITE, HIDEREACTION
} from "@constants";
const { SOCKET_EVENTS } = Sockets;
const colors = BaseConfig.AVATAR_DEF_BACK;

export const getStories = (isLoading) => async dispatch => {
    if (isLoading) dispatch({ type: LOADING, data: true });
    try {
        const stories_res = await ApiActions.getStories();
        if (stories_res?.success) {
            const data = stories_res.stories.map(item => ({ ...item, backgroundColor: colors[(Date.parse(new Date(item.updated_at || item.created_at)) % 3)] }));
            dispatch({ type: GETSTORIES_SUCCESS, data });
        } else {
            dispatch({ type: GETSTORIES_FAILED });
        }
    } catch (err) {

    }
    if (isLoading) dispatch({ type: LOADING, data: false });
}
export const visiteStory = (storyid, number) => dispatch => {
    ApiActions.visiteStory(storyid, number);
}
export const getGallery = (isLoading) => async dispatch => {
    if (isLoading) dispatch({ type: LOADING, data: true });
    const gallery_res = await ApiActions.getGallery();
    if (!gallery_res.success) {
        dispatch({ type: GETGALLERY_FAILED, data: false });
    }
    dispatch({ type: GETGALLERY_SUCCESS, data: gallery_res.gallery });
    if (isLoading) dispatch({ type: LOADING, data: false });
}
export const getMyStory = (isLoading) => async dispatch => {
    if (isLoading) dispatch({ type: LOADING, data: true });
    ApiActions.getVisitedMyStory();
    try {
        const res = await ApiActions.getMyStory();
        if (res?.success) {
            dispatch({ type: GETMYSTORY_SUCCESS, data: { story: res.story, gallery: res.gallery } });
        } else {
            dispatch({ type: GETMYSTORY_FAILED });
        }
    } catch (err) {
    }
    if (isLoading) dispatch({ type: LOADING, data: false });
}
export const addToFavourite = (data) => ({ type: ADDTOFAVOURITE, data })
export const removeFromFavourite = (data) => ({ type: REMOVEFROMFAVOURITE, data })
export const hideReaction = (data) => ({ type: HIDEREACTION, data })
export const getVisitedStories = () => async dispatch => {
    ApiActions.getVisitedStories();
}
export const listenVisitedMyStory = () => dispatch => {
    SocketManager.instance._LISTENEVENTS(SOCKET_EVENTS.GETMYSTORYVISITED, (data) => {
        dispatch({ type: GETVISITEDMYSTORY, data: data.visited });
    });
}

export const listenChangeStory = (callback) => dispatch => {
    SocketManager.instance._LISTENEVENTS(SOCKET_EVENTS.CHAGNESTORY, (data) => {
        if (data.new_story) {
            let myid = ApiActions._CURRENTUSERID();
            let visited_stories = data.visite_story.filter(item => item.userid == myid);
            dispatch({ type: CHAGNESTORY, data: visited_stories });
        }
        callback();
    });
}