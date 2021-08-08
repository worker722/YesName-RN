import { ApiActions, SocketManager } from "@actions";
import { Sockets } from '@config';
import { ARCHIVE, BLOCKLIST, GETCHATLIST, GETCHATROOM, GONEXTPAGE, NEWMESSAGE, READMESSAGE, MISSEDCALLS, CHATADDTOFAVOURITE, CHATREMOVEFROMFAVOURITE } from "@constants";
const { SOCKET_EVENTS } = Sockets;

export const getChatRoom = () => dispatch => {
    const userid = ApiActions._CURRENTUSERID();
    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.CHATROOMLIST, { userid });
}
export const listenChatList = () => dispatch => {
    SocketManager.instance._LISTENEVENTS(SOCKET_EVENTS.CHATROOMLIST, (res) => {
        dispatch({ type: GETCHATROOM, data: res });
        getChatHistory(dispatch);
        const create_user = global.chat_create_user;
        global.chat_create_user = 0;
        const security = ApiActions._CURRENTSECURITY();
        const checkSecurity = (roomid) => {
            try {
                return res.rooms?.find(item => item.roomid == roomid)?.security == security;
            } catch (error) {
                return false;
            }
        }
        if (create_user > 0) {
            try {
                let chat_user = res.joinusers.find(item => item.userid == create_user && checkSecurity(item.roomid));
                const roomid = chat_user?.roomid;
                if (roomid) {
                    dispatch({ type: GONEXTPAGE, data: { page: "Chat", params: { roomid } } })
                }
            } catch (error) {
                console.error({ error });
            }
        }
    });
}
export const getBlockList = () => dispatch => {
    const userid = ApiActions._CURRENTUSERID();
    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.BLOCKLIST, { userid });
}
export const listenBlockList = () => dispatch => {
    SocketManager.instance._LISTENEVENTS(SOCKET_EVENTS.BLOCKLIST, (res) => {
        dispatch({ type: BLOCKLIST, data: res?.users });
    });
}
export const getChatList = () => dispatch => {
    getChatHistory(dispatch);
}
export const getChatHistory = (dispatch) => {
    ApiActions.getChatList()
        .then(res => {
            if (res.success) {
                dispatch({ type: GETCHATLIST, data: res.chatlist })
            } else {
                dispatch({ type: GETCHATLIST, data: [] })
            }
        }).catch(err => {
        })
}
export const sendMessage = (data) => dispatch => {
    const security = ("security" in data) ? data.security : ApiActions._CURRENTSECURITY();
    data = { ...data, security };
    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.NEWMESSAGE, data);
}
export const readMessages = (roomid) => {
    ApiActions.readMessages(roomid);
    return ({ type: READMESSAGE, data: { roomid } })
}
export const receiveMessage = () => dispatch => {
    SocketManager.instance._LISTENEVENTS(SOCKET_EVENTS.NEWMESSAGE, (data) => {
        const userid = ApiActions._CURRENTUSERID();
        if (!data) return;
        if (data.sender == userid || data.roomid == global.roomid) {
            data.unread = null;
        }
        dispatch({ type: ARCHIVE, data: { roomid: data.roomid, archive: false } });
        dispatch({ type: NEWMESSAGE, data })
    });
}
export const createChat = (receiver) => dispatch => {
    const sender = ApiActions._CURRENTUSERID();
    const security = ApiActions._CURRENTSECURITY();
    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.NEWCHATROOM, { sender, receiver, security });
}
export const archiveRoom = (roomid, archive) => dispatch => {
    dispatch({ type: ARCHIVE, data: { roomid, archive } });
}
export const deleteRoom = (roomid) => dispatch => {
    const userid = ApiActions._CURRENTUSERID();
    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.DELETEROOM, { userid, roomid });
}
export const blockRoom = (roomid, isblock) => dispatch => {
    const userid = ApiActions._CURRENTUSERID();
    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.BLOCKROOM, { userid, roomid, isblock, ismute: false });
}
export const muteRoom = (roomid, mute) => dispatch => {
    const userid = ApiActions._CURRENTUSERID();
    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.BLOCKROOM, { userid, roomid, mute, ismute: true, });
}
export const reactionAnswer = (...data) => dispatch => {
    return ApiActions.reactionAnswer(...data);
}
export const deleteMessage = (messageid, chatuserid) => dispatch => {
    const userid = ApiActions._CURRENTUSERID();
    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.DELETEMESSAGE, { userid, messageid, chatuserid });
}
export const getMissedCalls = (read) => dispatch => {
    const userid = ApiActions._CURRENTUSERID();
    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.MISSEDCALLS, { userid, read });
}
export const listenMissedCalls = () => dispatch => {
    SocketManager.instance._LISTENEVENTS(SOCKET_EVENTS.MISSEDCALLS, (data) => {
        dispatch({ type: MISSEDCALLS, data })
    });
}
export const chatAddToFavourite = (msgid) => {
    return { type: CHATADDTOFAVOURITE, data: msgid }
}
export const chatRemoveFromFavourite = (msgid) => {
    return { type: CHATREMOVEFROMFAVOURITE, data: msgid }
}