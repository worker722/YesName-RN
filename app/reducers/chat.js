import { ARCHIVE, BLOCKLIST, GETCHATLIST, GETCHATROOM, NEWMESSAGE, MISSEDCALLS, READMESSAGE, CHATADDTOFAVOURITE, CHATREMOVEFROMFAVOURITE } from "@constants";
import { compareDate } from "@utils";
const initialState = {
    rooms: [],
    joinusers: [],
    messages: [],
    archived_room: [], //archived room id
    blocked_users: [],
    normal_unread: 0,
    security_unread: 0,
    missedcalls: 0,
    favourites: [],
};

export default (state = initialState, action = {}) => {
    let { messages, archived_room, favourites } = state;
    if (!favourites) favourites = [];

    const getUpdatedChatRooms = (update_rooms, allMessage) => {
        let normal_unread = 0;
        let security_unread = 0;
        update_rooms = update_rooms || state.rooms;
        allMessage = allMessage || messages;
        const getShortItem = ({ roomid, security }) => {
            let message = allMessage?.filter(item => item.roomid == roomid);
            message = message?.sort((a, b) => compareDate(b.id, a.id));
            const unreadcount = message.filter(item => item.unread > 0).length;
            // normal_unread
            if (security) {
                security_unread += unreadcount;
            } else {
                normal_unread += unreadcount;
            }
            message = message?.[0] || {};
            return { message, unreadcount };
        }
        update_rooms = (update_rooms || []).map(item => ({ ...item, ...getShortItem(item) }));
        update_rooms = update_rooms?.sort((a, b) => compareDate(b.message?.created_at, a.message?.created_at));
        return { rooms: update_rooms || [], normal_unread, security_unread };
    }
    switch (action.type) {
        case GETCHATROOM:
            messages = messages?.filter(msg => action.data?.rooms?.some(room => msg?.roomid == room?.roomid)) || [];
            archived_room = archived_room?.filter(archived_roomid => action.data?.rooms?.some(room => archived_roomid == room?.roomid)) || [];
            return { ...state, ...getUpdatedChatRooms(action.data?.rooms), joinusers: action.data.joinusers, messages, archived_room };
        case GETCHATLIST:
            return { ...state, messages: action.data, ...getUpdatedChatRooms(null, action.data) };
        case NEWMESSAGE:
            let allMessage = [...state.messages, action.data];
            return { ...state, messages: allMessage, ...getUpdatedChatRooms(null, allMessage) };
        case READMESSAGE:
            const { roomid } = action.data;
            messages = messages.map(msg => {
                if (roomid == msg.roomid && global.roomid == roomid && msg.unread > 0) {
                    msg.unread = null;
                }
                return msg;
            })
            return { ...state, messages: [...messages] };
        case ARCHIVE:
            if (action.data.archive) archived_room = [...archived_room, action.data.roomid];
            else archived_room = archived_room.filter(item => item != action.data.roomid);
            return { ...state, archived_room };
        case BLOCKLIST:
            return { ...state, blocked_users: action.data };
        case MISSEDCALLS:
            return { ...state, missedcalls: action.data };
        case CHATADDTOFAVOURITE:
            return { ...state, favourites: [...favourites, action.data] };
        case CHATREMOVEFROMFAVOURITE:
            return { ...state, favourites: [...favourites.filter(item => item != action.data)] };
        default:
            return state;
    }
};
