import * as reduxActions from "@actions";
import { BubbleImage, Icon, Text } from "@components";
import { BaseColor, BaseConfig, BaseStyle, Images } from "@config";
import React, { Component } from "react";
import { ActivityIndicator, ImageBackground, TouchableOpacity, View } from "react-native";
import AlertPro from "react-native-alert-pro";
import Toast from 'react-native-easy-toast';
import { connect } from "react-redux";
import styles from './styles';
import { translate } from "@utils";

const MENUITEMS = [
  { id: 1, image: Images.reaction, icon: "camera-reverse", title: "Reaction", type: 'Ionicons' },
  { id: 2, image: Images.ic_security, icon: "key", title: "Hidden" },
  { id: 6, image: Images.edit, icon: "new-message", title: "New Message", type: "Entypo" },
  { id: 3, image: Images.favourite, icon: "star", title: "Favourites" },
  // { id: 4, image:Images.search, icon: "search", title: "Search" },
  { id: 5, image: Images.user_setting, icon: "settings", title: "Profile Settings", type: 'Ionicons' },
]
class CustomViews extends Component {
  constructor(props) {
    super(props);
  }
  confirmAlert() {
    const { status: { alert } } = this.props;
    alert?.onConfirm && alert.onConfirm();
    this.props.destroyView();
  }
  componentDidUpdate() {
    const { status: { alert, toast } } = this.props;
    if (alert?.visible) {
      this.AlertPro.open();
    } else {
      try {
        this.AlertPro.close();
      } catch (err) {
      }
    }
    if (toast?.visible) {
      this.toast?.show(translate(toast?.message));
      this.props.emptyToast();
    }
  }
  OnPressMenuItem(type) {
    const { app: { security, pendingpage } } = this.props;
    if (pendingpage && type == 2) return;
    this.props.destroyView();
    switch (type) {
      case 1:
        this.props.goNextPage({ page: "CustomCamera", params: { type: BaseConfig.CAMERATYPE.SETTINGREACTION } });
        return;
      case 2:
        this.props.changeSecurity(true);
        this.props.goNextPage({ page: "ChatHome" });
        return;
      case 3:
        this.props.goNextPage({ page: "Favourite" });
        return;
      case 4:
        this.props.goNextPage({ page: "Search" });
        return;
      case 5:
        this.props.goNextPage({ page: "ProfileSettings" });
        return;
      case 6:
        this.props.goNextPage({ page: "InviteFriends", params: { type: 1 } });
        return;
    }
  }
  renderMenuItem({ id, title, image }, action) {
    let active = false;
    const { app: { security } } = this.props;
    if (id == 2) {
      active = security;
    }
    return (
      <TouchableOpacity key={id} style={styles.menuitem} onPress={() => action ? action() : this.OnPressMenuItem(id)}>
        <BubbleImage source={image} size={19} />
        {title && <Text blackColor={!active} primaryColor={active} bold headline style={{ marginLeft: 6 }}>{title}</Text>}
      </TouchableOpacity>
    );
  }
  render() {
    let { status: { loading, alert, text, more_plus }, app: { security } } = this.props;
    return (
      <>
        {alert?.visible && <View style={[{ width: "100%", height: "100%", position: "absolute", backgroundColor: BaseColor.blackLightOpacity }]} />}
        {loading &&
          <View style={styles.container}>
            <View style={styles.subContain}>
              <ActivityIndicator style={{ transform: [{ scale: 1.3 }] }} size={"large"} color={BaseColor.whiteColor} />
              <Text whiteColor title3 style={{ marginTop: 20 }} bold>{text || "Loading..."}</Text>
            </View>
          </View>
        }
        {more_plus?.visible && (
          <>
            <TouchableOpacity
              activeOpacity={1}
              onPress={this.props.destroyView}
              style={{
                position: "absolute",
                flex: 1,
                width: "100%",
                height: "100%",
                backgroundColor: "#00000044"
              }} />
            <ImageBackground
              source={Images.header_back}
              resizeMode={"stretch"}
              style={{
                position: "absolute",
                bottom: 90,
                right: 10,
                flex: 1,
                borderRadius: 12,
                overflow: "hidden",
                padding: 8
              }}
            >
              {MENUITEMS.map(item => this.renderMenuItem(item))}
              <View style={styles.close}>
                <TouchableOpacity onPress={this.props.destroyView}>
                  <Icon name={"times"} size={22} color={BaseColor.primaryColor} />
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </>
        )}
        <AlertPro
          ref={ref => this.AlertPro = ref}
          onConfirm={this.confirmAlert.bind(this)}
          onCancel={() => { this.props.destroyView(); alert?.onClose && alert.onClose() }}
          title={translate(alert?.title)}
          message={translate(alert?.message)}
          showConfirm={translate(alert?.isConfirm)}
          textConfirm={translate(alert?.textConfirm || "Confirm")}
          textCancel={translate(alert?.textCancel || "Close")}
          closeOnPressBack={false}
          closeOnPressMask={false}
          customStyles={
            {
              mask: {
                backgroundColor: BaseColor.transparent
              },
              container: {
                borderWidth: 2,
                borderColor: BaseColor.primaryColor,
                shadowColor: BaseColor.blackColor,
                shadowOpacity: 0.1,
                shadowRadius: 10
              },
              buttonConfirm: {
                backgroundColor: BaseColor.primaryColor
              }
            }
          }
        />
        <Toast
          ref={(ref) => this.toast = ref}
          position='top'
          fadeInDuration={1500}
          fadeOutDuration={3000}
          opacity={0.8}
          style={BaseStyle.toast}
          textStyle={BaseStyle.toast_text}
        />
      </>
    )
  }
}
const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(CustomViews);