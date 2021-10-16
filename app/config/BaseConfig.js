const PRODUCT_MODE_SERVER = true;
const SERVER_DOMAIN = PRODUCT_MODE_SERVER ? `13.37.177.37` : '192.168.109.71';
// const SERVER_PORT = 3333;
// const SERVER_DOMAIN = `appconnect.asbeda-int.akadns.net`;
const SERVER_PORT = 80;

const PEER_PATH = `/yesname-peer`;

const SERVER_HOST = `http://13.37.177.37:${SERVER_PORT}`;

const AVATAR_DEF_BACK = ["#adf0d1", "#06c4c5", "#f57268"];

const BOTTOMBARHEIGHT = 65;
const TABBAR_HEIGHT = 32;
// 4*2
// 2*2, 2*2
// 2*2, 1*1, 1*1, 1*1, 1*1
// 1*1, 1*1, 1*1, 1*1, 2*2
const THEME_IMAGE_NUM = [1, 2, 5, 5];

const UPLOADTYPE = {
  GALLERY: "gallery",
  PROFILE: "profile",
  INTROVIDEO: "intro",
  CHAT: "chat",
  LOGGER: "logger",
};
const CONTENTTYPE = {
  TEXT: 0,
  FILE: 1,
  CONTACTS: 2,
  LOCATION: 3,
  IMAGE: 4,
  VIDEO: 5,
  AUDIO: 6,
  FORWARD: 7, //FORWARD MESSAGE
  STORY: 8, //SEND ON STROY
  REACTION: 9, //REACTION WITH IAMGE
  REPLY_REACTION: 10,
};
const max_upload_size = 500; //max file upload size mb
const URLSPLITTER = "?!@#$";
const CALL = {
  TEXT: 0,
  VOICE: 1,
  VIDEO: 2,
}
const CALLINGSTATE = {
  INCOMING: "incoming", //receiver incoming
  MISSED: "missed", //sender end
  BUSY: "busy", //receiver busy
  ACCEPT: "accept", // receiver accept
  DECLINE: "decline",//receiver decline
  END: "endcall"// receiver, sender end
}
const CHAGNECALLSTATE = {
  REQUEST: "REQEUST",
  END: "END",
  DECLINE: "DECLINE",
  ACCEPT: "ACCEPT"
}
const INVITEPAGETYPE = {
  INVITE: 0,
  CREATECHAT: 1,
  SELECTCONTACTS: 2,
  FORWARD: 3,
  REACTION: 4
}
const MISSED_CALL_TIME = 20000; //milesecond
const PEERCONFIG = {
  host: SERVER_DOMAIN,
  secure: false,
  port: SERVER_PORT,
  path: PEER_PATH
}
const CAMERATYPE = {
  EDITCAMERA: "EDITCAMERA",
  REACTION: "REACTION",
  CHATREACTION: "CHATREACTION",
  SETTINGREACTION: "SETTINGREACTION"
}
const MUTE_KEY = "mute";

export {
  PRODUCT_MODE_SERVER,
  SERVER_HOST,
  AVATAR_DEF_BACK,
  TABBAR_HEIGHT,
  THEME_IMAGE_NUM,
  UPLOADTYPE,
  BOTTOMBARHEIGHT,
  CONTENTTYPE,
  max_upload_size,
  CALL,
  CALLINGSTATE,
  MISSED_CALL_TIME,
  PEERCONFIG,
  CHAGNECALLSTATE,
  URLSPLITTER,
  INVITEPAGETYPE,
  CAMERATYPE,
  MUTE_KEY
};
