import { ApiActions } from "@actions";
import { Sockets } from '@config';
import io from 'socket.io-client';
import * as logger from "./logger";

class SocketManager {
  socket = null;
  constructor() {
    if (SocketManager.instance)
      return SocketManager.instance;
    SocketManager.instance = this;
    alert(Sockets.SOCKET_IO_SERVER);
    this.socket = io(Sockets.SOCKET_IO_SERVER, { path: Sockets.SOCKET_IO_PATH });
    this.setupListenDefaultEvents();
    return this;
  }
  setupListenDefaultEvents() {
    this.socket.on('connect', () => {
      logger.log('connect');
      this.connectedSocket();
    });
    this.socket.on('disconnect', () => {
      logger.log('disconnect');
    });
  }
  connectedSocket() {
    const userid = ApiActions._CURRENTUSERID();
    if (userid) {
      logger.log("socket connect", userid);
      this._EMITEVENTS(Sockets.SOCKET_EVENTS.SOCKETCONNECTED, { userid });
      return;
    }
    setTimeout(() => {
      this.connectedSocket();
    }, 5000);
  }
  _LISTENEVENTS(event, callback = () => null) {
    this.socket.off(event);
    this.socket.on(event, (data) => {
      return callback(data);
    });
  }
  _REMOVELISTENEVENTS(event) {
    this.socket.off(event);
  }

  _EMITEVENTS(event, data) {
    this.socket.emit(event, data);
  }
}

const instance = new SocketManager();
Object.freeze(instance);

export default SocketManager;
