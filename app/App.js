/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import { initFCM, initPeer, logger } from "@actions";
import { Images } from "@config";
import CustomPushAlert from "@screens/CustomPushAlert";
import CustomViews from "@screens/CustomViews";
import { persistor, store } from "@store";
import * as Utils from "@utils";
import React, { Component } from "react";
import { ImageBackground, LogBox, Platform, StatusBar } from "react-native";
import * as RNLocalize from "react-native-localize";
import RNVoipCall from 'react-native-voip-call';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import Navigation from "./navigation";
import messaging from '@react-native-firebase/messaging';

LogBox.ignoreAllLogs(true);
export default class App extends Component {
  constructor(props) {
    super(props);
    Utils.setI18nConfig();
    global.nofirstloading = this.props.callerId || this.props.notificationId;
  }
  componentDidMount() {
    messaging().registerDeviceForRemoteMessages()
      .then(res => {
        logger.log("messaging register", res);
      })
      .catch(err => {
        logger.error("messaging register", res);
      });
    global.openRoomId = null;
    if (this.props.callerId && this.props.notificationId) {
      global.displayedIncom = true;
      RNVoipCall.endAllCalls();
      // {"action": "callAnswer", "callerId": "88", "notificationId": 7137, "roomid": "", "type": "2"}
      global.answer = this.props.action == "callAnswer"; //fullScreenIntent, contentTap
      const callerid = this.props.callerId;
      const roomid = this.props.roomid;
      const state = this.props.action;
      const type = parseInt(this.props.type);
      global.calling_userid = callerid;
      global.calling_user = { callerid, state, type, roomid };
    } else if (this.props.roomid) {
      global.openRoomId = this.props.roomid;
    }
    initFCM();
    initPeer();
    if (Platform.OS == "android") {
      StatusBar.setBackgroundColor("rgba(0,0,0,0)")
      StatusBar.setBarStyle("dark-content")
      StatusBar.setTranslucent(true);
    }
    // StatusBar.setHidden(true);
    RNLocalize.addEventListener("change", this.handleLocalizationChange);
  }
  componentWillUnmount() {
    RNLocalize.removeEventListener("change", this.handleLocalizationChange);
  }
  handleLocalizationChange = () => {
    Utils.setI18nConfig();
    this.forceUpdate();
  };
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ImageBackground source={Images.background} resizeMode={"stretch"} style={{ flex: 1 }}>
            <Navigation />
            <CustomViews />
            <CustomPushAlert />
          </ImageBackground>
        </PersistGate>
      </Provider>
    );
  }
}
