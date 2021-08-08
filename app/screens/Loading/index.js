import * as reduxActions from "@actions";
import { Image } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import messaging from '@react-native-firebase/messaging';
import { security } from '@utils';
import React, { Component } from "react";
import { ActivityIndicator, ImageBackground, PermissionsAndroid, Platform, View } from "react-native";
import { getUniqueId } from 'react-native-device-info';
import RNFS from 'react-native-fs';
import { connect } from "react-redux";
import styles from "./styles";
const { ApiActions, logger } = reduxActions;
import Clipboard from '@react-native-community/clipboard';

// app permission (android only)
const _PERMISSIONS = [
  PermissionsAndroid.PERMISSIONS.CAMERA,
  PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
  PermissionsAndroid.PERMISSIONS.READ_SMS,
];

class Loading extends Component {
  constructor(props) {
    super(props);
    // delete image cache
    RNFS.unlink(RNFS.CachesDirectoryPath)
      .then(res => logger.log("clean cache"))
      .catch(err => logger.error("clean cache error", err));
  }
  async componentDidMount() {
    var ReactionTheme = [];
    for (let i = 0; i < BaseConfig.THEME_IMAGE_NUM.length * 4; i++) {
      let index = Math.floor(Math.random() * BaseConfig.THEME_IMAGE_NUM.length);
      if (i > 0 && index == ReactionTheme[i - 1]) continue;
      ReactionTheme.push(index);
    }
    global.ReactionTheme = ReactionTheme;

    if (this.props.app?.security == true) {
      security(true);
    }
    this.props.changeSecurityBar(false);

    if (global.nofirstloading) {
      this.props.navigation.navigate("Main");
    }
    this.props.destroyView();
    this.props.initStores();

    this.requestAndroidPermission();
    this.requestUserPermission();
    this.checkDeviceAuth();
    this.props.initTokens();
  }
  async requestUserPermission() {
    const authStatus = await messaging().requestPermission({
      badge: true,
      sound: true,
      alert: true
    });
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      logger.log('Authorization status:', authStatus);
    }
    return;
  }
  async checkDeviceAuth() {
    const navigate = (name) => {
      const time = (global.calling_user || global.openRoomId) ? 1 : 1000;
      setTimeout(() => {
        this.props.navigation.navigate(name);
      }, time);
    };

    try {
      this.props.getConfigAction();
      global.device = await getUniqueId();
      // ---------------------------------------------------------------------------------------------------------------------------------------
      logger.log(global.device, "copied device SN to clipboard");
      Clipboard.setString(global.device);
      // ---------------------------------------------------------------------------------------------------------------------------
      const res = await ApiActions.check_state(global.device);
      if (res.code == 200) {
        this.props.getMyInfo();
        if (res.success) {
          if (!res.user?.name) return navigate("InitProfile");
          if (res.user?.visit_intro != 1) return navigate("IntroductionVideo");
          if (res.user?.visit_invite != 1) return navigate("InviteFriends");
          return navigate("Main");
        } else {
          global.verify_code = res.verify_code;
          return navigate("Verification");
        }
      } else {
        this.props.showToast(res?.message || "Something went wrong");
      }
    } catch (err) {
    }
    return navigate("Login");
  }
  requestAndroidPermission = async () => {
    try {
      if (Platform.OS != "android") return;
      const granted = await PermissionsAndroid.requestMultiple(_PERMISSIONS);
      let permissionGranted = true;
      let permissionNeverAsk = false;
      _PERMISSIONS.every((item, index) => {
        if (granted[item] !== PermissionsAndroid.RESULTS.GRANTED) {
          permissionNeverAsk = granted[item] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;
          permissionGranted = false;
          return false;
        };
        return true;
      })
      if (permissionGranted) {
      } else if (!permissionNeverAsk) {
        this.requestAndroidPermission();
      }
    } catch (err) {
    }
  };
  render() {
    return (
      <ImageBackground source={Images.splash} resizeMode={"stretch"} style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={{ alignItems: "center", marginTop: -200 }}>
            <Image source={Images.logo} style={styles.logo} noloading nopreview />
          </View>
          <ActivityIndicator
            size="large"
            color={BaseColor.primaryColor}
            style={styles.loading}
          />
        </View>
      </ImageBackground>
    );
  }
}
const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }
export default connect(mapStateToProps, mapDispatchToProps)(Loading);