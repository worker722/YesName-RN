import { BaseConfig } from "@config";

const SOCKET_IO_SERVER = BaseConfig.SERVER_URL;
const SOCKET_IO_PATH = '/api/socket.io';
const SOCKET_EVENTS = {
  SOCKETCONNECTED: "SOCKETCONNECTED",
  SOCKETDISCONNECTED: "SOCKETDISCONNECTED",
  NEWMESSAGE: "NEWMESSAGE",
  NEWCHATROOM: "NEWCHATROOM",
  CHATROOMLIST: "CHATROOMLIST",
  CHAGNESTORY: "CHAGNESTORY",
  GETMYSTORYVISITED: "GETMYSTORYVISITED",
  CALLUSER: "CALLUSER",
  CALLING: "CALLING",
  DISCONNECTME: "DISCONNECTME",
  ROOMSTATE: "ROOMSTATE",
  DELETEROOM: "DELETEROOM",
  BLOCKROOM: "BLOCKROOM",
  BLOCKLIST: "BLOCKLIST",
  CHANGECALL: "CHANGECALL",
  DELETEMESSAGE: "DELETEMESSAGE",
  MISSEDCALLS: "MISSEDCALLS"
};
export {
  SOCKET_IO_SERVER,
  SOCKET_EVENTS,
  SOCKET_IO_PATH
};
