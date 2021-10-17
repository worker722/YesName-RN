import { ApiActions, SocketManager } from "@actions";
import { BaseConfig, Sockets } from "@config";
import { FORCECLOSE, GONEXTPAGE, NEWCALL, NOTIFICATION, ARCHIVE, NEWMESSAGE } from "@constants";
import messaging from '@react-native-firebase/messaging';
import { store } from "@store";
import { AppState, Platform } from "react-native";
import Peer from "react-native-peerjs";
import RNVoipCall, { RNVoipPushKit } from 'react-native-voip-call';
import { setDeviceToken } from "./api";
import { translate } from "@utils";
var ShortcutBadge;
if (Platform.OS == "android") {
    ShortcutBadge = require('react-native-app-badge').default;
}
const { CALLINGSTATE } = BaseConfig;
const { SOCKET_EVENTS } = Sockets;
import * as logger from "./logger";
let peerServer = null;

export const initPeer = () => {
    peerServer = new Peer();
    // peerServer = new Peer(null, BaseConfig.PEERCONFIG);
    peerServer.on('error', (err) => { global.mypeerid = null; logger.error("peer err", err) })
    peerServer.on('disconnected', (res) => {
        setTimeout(() => {
            try {
                peerServer.reconnect()
            } catch (error) {
                logger.error("peer reconnect error", error);
                try {
                    peerServer = new Peer(null, BaseConfig.PEERCONFIG);
                } catch (error) {
                    logger.error("peer recreate error", error);
                }
            }
        }, 5000);
    })
    peerServer.on("open", (userid) => { global.mypeerid = userid })
}
export const setRemoteStream = (data) => dispatch => {
    dispatch({ type: NEWCALL, data })
}
export const connectToNewUser = (userid, stream) => dispatch => {
    connectToNewPeer(userid, stream, dispatch);
}
export const connectToNewPeer = (userid, stream, dispatch) => {
    const call = peerServer.call(userid, stream);
    call.on('stream', (remoteVideoStream) => {
        if (remoteVideoStream?.toURL?.()) {
            dispatch({ type: NEWCALL, data: remoteVideoStream })
        } else {
            setTimeout(() => {
                connectToNewPeer(userid, stream, dispatch);
            }, 500);
        }
    })
}
export const receiveCall = (mystream) => dispatch => {
    // receive call
    peerServer.on('call', (call) => {
        call.answer(mystream);
        call.on('stream', stream => {
            dispatch({ type: NEWCALL, data: stream })
        })
    })
}
export const initFcmToken = () => dispatch => {
    initFCM();
}
export const initFCM = () => {
    if (Platform.OS == "android") {
        ShortcutBadge.setCount(0)
            .then(res => {
                logger.log("int badge", res);
            })
            .catch(err => {
                logger.error("set badge error", err);
            });

    }
    messaging()
        .setBackgroundMessageHandler(backgroundNotification);

    messaging().onMessage(msg => {
        if (global.roomid != msg?.data?.roomid) {
            store.dispatch({ type: NOTIFICATION, data: msg });
        }
    })
    iosPushKit();
}
export const initTokens = () => dispatch => {
    messaging()
        .getToken()
        .then(setDeviceToken)
        .catch(err => setDeviceToken(null));
    messaging()
        .onTokenRefresh(setDeviceToken);
    RNVoipPushKit.getPushKitDeviceToken((res) => {
        setDeviceToken(res.deviceToken, false)
    });
}
const iosPushKit = () => {
    if (Platform.OS == "ios") {
        RNVoipPushKit.requestPermissions();
        //On Remote Push notification Recived in Forground
        RNVoipPushKit.RemotePushKitNotificationReceived(({ data }) => {
            if (data) global.calling_user = data
        });

        let options = {
            appName: translate('app-name'),
            imageName: 'icon',
            includesCallsInRecents: false,
            supportsVideo: true
        }
        RNVoipCall.initializeCall(options)
            .then(() => { })
            .catch(err => logger.error("voip init error", err));
    }

    RNVoipCall.onCallAnswer(res => {
        RNVoipCall.endAllCalls();
        const data = global.calling_user || {};
        global.calling_userid = data.callerid;
        store.dispatch({ type: GONEXTPAGE, data: { page: "InOutCalling", params: { data, answer: true } } });
    });
    RNVoipCall.onEndCall(res => {
        RNVoipCall.endAllCalls();
        global.calling_userid = null;
        sendCallEvents({ ...global.calling_user, state: CALLINGSTATE.DECLINE });
    });
    RNVoipCall.addEventListener('didDisplayIncomingCall', ({ data }) => {
        if (data?.endcall == true || data?.endcall == "true") {
            RNVoipCall.endAllCalls();
            global.calling_user = null;
            return;
        }
        if (data) global.calling_user = data
    });
}
// callerid, state, type, roomid
const displayIncoming = (data, duration = BaseConfig.MISSED_CALL_TIME) => {
    const { callerid, state, type, roomid } = data;
    const users = store.getState().users.users || {};
    const caller = users?.find(item => item.id == callerid) || {};
    global.calling_user = data;

    let callOptions = {
        callerId: String(callerid),
        ios: {
            phoneNumber: caller.phone,
            name: caller.name,
            hasVideo: type == BaseConfig.CALL.VIDEO
        },
        android: {
            ringtuneSound: true,
            ringtune: 'ringtune',
            duration,
            vibration: true,
            channel_name: 'call',
            notificationId: callerid,
            notificationTitle: translate('Incoming Call'),
            notificationBody: translate('%1 is Calling...', caller.name || translate('Someone')),
            answerActionTitle: translate('Answer'),
            declineActionTitle: translate('Decline'),
            roomid: roomid,
            type: String(type),
        }
    }
    RNVoipCall.displayIncomingCall(callOptions)
        .then(logger.log)
        .catch((err) => logger.error("display incoming call", err));
}
export const backgroundNotification = async (remoteMessage) => {
    const { data } = remoteMessage;
    if (data.incoming) {
        displayIncoming(data);
    } else if (data.endcall) {
        RNVoipCall.endAllCalls();
        RNVoipCall.showMissedCallNotification(translate("Missed Call"), translate("You have a missed call from someone."));
        global.calling_user = {};
    } else {
        if (AppState.currentState == "background") {
            const userid = ApiActions._CURRENTUSERID();
            if (!data) return;
            if (data.sender == userid || data.roomid == global.roomid) {
                data.unread = null;
            }
            store.dispatch({ type: ARCHIVE, data: { roomid: data.roomid, archive: false } });
            store.dispatch({ type: NEWMESSAGE, data })
        }
        if (Platform.OS == "android") {
            ShortcutBadge.getCount().then((count) => {
                logger.log("get badge", count);
                count += 1;
                ShortcutBadge.setCount(count)
                    .then(res => {
                        logger.log("set badge", res, count);
                    })
                    .catch(err => {
                        logger.error("set badge error", err);
                    });
            })
                .catch(err => {
                    logger.error("get badge error", err);
                });
        }
    }
}
export const callUser = (receiverid, type) => dispatch => {
    global.calling_userid = receiverid;
    const callerid = ApiActions._CURRENTUSERID();
    const security = ApiActions._CURRENTSECURITY();
    const data = {
        receiverid,
        callerid,
        type,
        state: CALLINGSTATE.INCOMING,
        security
    };

    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.CALLUSER, data);
}
export const sendCalling = (data) => dispatch => {
    sendCallEvents(data);
}
export const listenCalling = (callback) => dispatch => {
    SocketManager.instance._LISTENEVENTS(SOCKET_EVENTS.CALLING, (res) => { //res: callerid, state, type
        const userid = ApiActions._CURRENTUSERID();
        if (userid == res.callerid) callback(res);
    });
    SocketManager.instance._LISTENEVENTS(SOCKET_EVENTS.DISCONNECTME, (userid) => {
        userid = parseInt(userid);
        if (userid > 0 && global.callscreen && userid == global.calling_userid) {
            dispatch({ type: FORCECLOSE, data: true });
        }
    });
}
export const forceClose = () => dispatch => {
    dispatch({ type: FORCECLOSE, data: false });
}
export const offlistenCalling = () => dispatch => {
    SocketManager.instance._REMOVELISTENEVENTS(SOCKET_EVENTS.CALLING);
    SocketManager.instance._REMOVELISTENEVENTS(SOCKET_EVENTS.DISCONNECTME);
}
const sendCallEvents = (data) => { //res: callerid, state, type, roomid
    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.CALLING, data);
}
const IncomingCall = (data) => {////res: callerid, state, type, roomid
    if (!data) return;
    if (global.callscreen) {
        sendCallEvents({ ...data, state: CALLINGSTATE.BUSY });
        return;
    }
    global.calling_userid = data.callerid;

    store.dispatch({ type: GONEXTPAGE, data: { page: "InOutCalling", params: { data, answer: false } } });
}
export const listenIncoming = () => dispatch => {
    SocketManager.instance._LISTENEVENTS(SOCKET_EVENTS.CALLUSER, (res) => { //res: callerid, state, type, roomid
        if (res.state == CALLINGSTATE.END) {
            RNVoipCall.endAllCalls();
            RNVoipCall.showMissedCallNotification(translate("Missed Call"), translate("You have a missed call from someone."));
            global.calling_user = {};
        }
        if (AppState.currentState == "active") {
            IncomingCall(res);
            // } else {
            // displayIncoming(res);
        }
    });
}
export const listenRoomState = (callback) => dispatch => {
    SocketManager.instance._LISTENEVENTS(SOCKET_EVENTS.ROOMSTATE, callback);
}
export const emitRoomState = (roomid) => dispatch => {
    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.ROOMSTATE, { roomid });
}
export const listenCallingState = (callback) => dispatch => {
    SocketManager.instance._LISTENEVENTS(SOCKET_EVENTS.CHANGECALL, callback);
}
export const emitChangeCallingState = (data) => dispatch => {
    SocketManager.instance._EMITEVENTS(SOCKET_EVENTS.CHANGECALL, data);
}