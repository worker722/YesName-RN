import { BaseConfig } from "@config";
import { store } from "@store";

const _CURRENTUSERID = () => {
    return store.getState().auth.user.id;
}
const _CURRENTSECURITY = () => {
    return store.getState().app.security;
}
const _REQUEST2SERVER = (url, params = null, isFormdata = false) => {
    const isGet = (params == null);
    return new Promise(function (resolve, reject) {
        fetch(`${BaseConfig.SERVER_HOST}/api/v1/${url}`, {
            method: isFormdata ? "post" : isGet ? 'get' : 'post',
            headers: {
                'content-type': isFormdata ? 'multipart/form-data' : 'application/json'
            },
            ...(!isGet && { body: isFormdata ? params : JSON.stringify(params) })
        })
            .then(res => res.json())
            .then(res => resolve(res))
            .catch(err => reject(err));
    });
}
const getConfig = () => {
    return _REQUEST2SERVER("config");
}
const getUser = (data) => {
    return _REQUEST2SERVER("user", data);
}
const check_state = (device) => {
    return _REQUEST2SERVER("check_device", { device });
}
const login = (data) => {
    return _REQUEST2SERVER("login", data);
}
const send_verify_code = (data) => {
    return _REQUEST2SERVER("send_verify_code", data);
}
const verification = (data) => {
    return _REQUEST2SERVER("verify", data);
}
const updateProfile = (data) => {
    return _REQUEST2SERVER(`update_profile/${_CURRENTUSERID()}`, data);
}
const uploadFile = (formdata) => {
    return _REQUEST2SERVER("upload", formdata, true);
}
const getUsers = () => {
    return _REQUEST2SERVER("user");
}
const updateUser = (userid, data) => {
    return _REQUEST2SERVER(`user/update/${userid}`, data);
}
const sendSMS = (data) => {
    return _REQUEST2SERVER(`sendSMS`, { data });
}
const addStoryMedia = (data) => {
    return _REQUEST2SERVER(`story/add/${_CURRENTUSERID()}`, data);
}
const getStories = () => {
    return _REQUEST2SERVER(`story/index`, {});
}
const getMyStory = () => {
    return _REQUEST2SERVER(`story/${_CURRENTUSERID()}`, null);
}
const getGallery = () => {
    return _REQUEST2SERVER(`gallery`, null);
}
const deleteGallery = (gallery_ids) => {
    return _REQUEST2SERVER(`gallery/delete`, { gallery_ids });
}
const getUserStates = () => {
    return _REQUEST2SERVER(`states`, null);
}
const getChatList = () => {
    return _REQUEST2SERVER(`chat/index`, { userid: _CURRENTUSERID() });
}
const readMessages = (roomid) => {
    return _REQUEST2SERVER(`chat/read`, { userid: _CURRENTUSERID(), roomid });
}
const visiteStory = (storyid, number) => {
    return _REQUEST2SERVER(`story/visite`, { userid: _CURRENTUSERID(), storyid, number });
}
const getAllGifs = ({ search, pos, limit = 50 }) => {
    return new Promise((resolve, reject) => {
        let url = `https://api.tenor.com/v1/search?key=${global.config?.tenor_key}`;
        search && (url += `&q=${search}`);
        pos && (url += `&pos=${pos}`);
        limit && (url += `&limit=${limit}`);
        fetch(url, {
            method: 'get',
            headers: {
                'content-type': 'application/json'
            },
        })
            .then(res => res.json())
            .then(res => {
                res.results = res.results.map(item => { let media = item.media[0]; if (!media) return null; return { nanogif: media.nanogif, mediumgif: media.mediumgif } });
                res.results = res.results.filter(item => item);
                resolve(res);
            })
            .catch(err => reject(err));
    })
}
const getVisitedStories = () => {
    return _REQUEST2SERVER(`story/getvisited`, { userid: _CURRENTUSERID() });
}
const setDeviceToken = (token, isfcm = true) => {
    return _REQUEST2SERVER(`user/fcm_token`, { token, userid: _CURRENTUSERID(), isfcm });
}
const callUser = (receiver, type, state, peerid) => {
    return _REQUEST2SERVER(`call`, { receiver, peerid, type, caller: _CURRENTUSERID(), state });
}
const getVisitedMyStory = () => {
    return _REQUEST2SERVER(`story/mystory_visited`, { userid: _CURRENTUSERID() });
}
const checkChatRoom = (roomid) => {
    return _REQUEST2SERVER(`checkRoom`, { roomid, userid: _CURRENTUSERID() });
}
const reactionAnswer = (messageid, hidden) => {
    return _REQUEST2SERVER(`reaction_answer`, { messageid, hidden });
}
const getAllMessages = () => {
    return _REQUEST2SERVER(`allmessages`, null);
}
const getAllMedia = (userid) => {
    return _REQUEST2SERVER(`allmedia`, { userid });
}
const addWatermark = (path) => {
    return _REQUEST2SERVER(`addWatermark`, { path });
}
const deleteFile = (path) => {
    return _REQUEST2SERVER(`deletefile`, { path });
}
export {
    getConfig, getUser, check_state, login, send_verify_code, verification, updateProfile, uploadFile, getUsers, updateUser, visiteStory, getVisitedStories, sendSMS, addStoryMedia, getStories, getGallery, getMyStory, deleteGallery, getUserStates, _CURRENTUSERID, _CURRENTSECURITY, getChatList, readMessages, getAllGifs, setDeviceToken, callUser, getVisitedMyStory, checkChatRoom, reactionAnswer, getAllMessages, getAllMedia, addWatermark, deleteFile
};
