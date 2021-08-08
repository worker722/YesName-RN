import * as reduxActions from "@actions";
import { Profile1, Text, BubbleImage, BubbleIcon, Icon } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import { translate, phoneformatter } from "@utils";
import React, { Component } from "react";
import { View, TouchableOpacity, ScrollView, Linking, ImageBackground } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
const { ApiActions, logger } = reduxActions;

class UserProfile extends Component {
  state = {
    user: {},
    count: 0
  }
  constructor(props) {
    super(props);
    this.params = props.route.params;
  }
  componentDidMount() {
    const userid = this.params.userid;
    this.props.showLoading(true);
    this.props.getBlockList();
    ApiActions.getUser({ userid })
      .then(res => {
        if (res.success) {
          this.setState({ user: res.user });
        }
      })
      .catch(err => {
        logger.error("user profile", err)
      })
      .finally(() => {
        ApiActions.getAllMedia(userid)
          .then(res => {
            const count = parseInt(res.chats.length) + parseInt(res.galleries.length);
            this.setState({ count })
          })
          .catch(err => {
            this.setState({ count: 0 })
            console.error(err)
          })
          .finally(() => this.props.showLoading(false))
      })
  }
  onGoBack() {
    this.props.navigation.goBack();
  }
  handlePhonePress(phone) {
    const url = `tel:${phone}`
    Linking.openURL(url)
  }
  openChat() {
    const { user } = this.state;
    global.chat_create_user = user.id;
    this.props.createChat(user.id);
  }
  openCall(type) {
    const { user } = this.state;
    const data = { userid: user.id, state: BaseConfig.CALLINGSTATE.INCOMING, type };
    this.props.navigation.navigate("InOutCalling", { data })
  }
  onPressAction(type) {
    const { userid, roomid } = this.params;
    const { ismute, isblock } = this.CurStates;

    if (type == 1) {
      const { users: { users }, stories: { visited_stories, stories, gallery } } = this.props;
      const story = stories.find(item => item.userid == userid);
      if(story?.storyid > 0) {}
      else return;
      const user = users.find(item => item.id == userid);
      let visited_story = visited_stories?.find(visited_story_item => visited_story_item.storyid == story.storyid) || {};
      let galleries = gallery?.filter(item => item.storyid == story?.storyid);
      if (story && user && galleries && galleries.length > 0) {
        this.props.navigation.navigate("StoryView", { type: 2, user, storyid: story.storyid, visited_story });
      }
    } else if (type == 2) {
      this.props.navigation.navigate("Medias", { userid });
    } else if (type == 3 || type == 4) {
      this.props.showAlert({
        title: "Confirm",
        message: `Do you really want to ${type == 2 ? (isblock ? "unblock" : "block") : (ismute ? "unmute" : "mute")} this chat?`,
        textConfirm: "Yes",
        textCancel: "No",
        visible: true,
        onConfirm: () => {
          if (type == 2) {
            this.props.blockRoom(roomid, !isblock);
          } else {
            this.props.muteRoom(roomid, ismute ? "" : BaseConfig.MUTE_KEY);
          }
        },
      })
    }
  }
  renderSettingItem({ title, image, id, disabled, subtitle }) {
    return (
      <TouchableOpacity
        key={id}
        onPress={this.onPressAction.bind(this, id)}
        disabled={disabled}
        style={[styles.setting_item, styles.center]}>
        <BubbleImage disable source={image} size={24} padding={8} active={'default'} />
        <View style={styles.setting_item_title}>
          <Text whiteColor headline>{title}</Text>
        </View>
        <Text grayColor headline>  {subtitle || ''}  </Text>
        <ImageBackground
          resizeMode={"stretch"}
          source={Images.header_back}
          style={[styles.setting_item_arrow, styles.center]}>
          <Icon name={"angle-right"} color={BaseColor.primaryColor} size={18} />
        </ImageBackground>
      </TouchableOpacity>
    )
  }
  get CurStates() {
    const { userid, roomid } = this.params;
    const { chat: { blocked_users, rooms } } = this.props;
    const isblock = blocked_users.find(item => item.userid == userid);
    const room = rooms.find(item => item.roomid == roomid);
    const ismute = room?.mute == BaseConfig.MUTE_KEY;
    return { isblock, ismute };
  }
  get SettingsData() {
    const { ismute, isblock } = this.CurStates;
    const { count } = this.state;
    const _SETTINGS = [
      { id: 1, image: Images.ic_gallery, title: "Open Story" },
      { id: 2, image: Images.image, title: "Media-links", subtitle: count || '' },
      { id: 3, image: Images.block1, title: isblock ? "Unblock" : "Block" },
      { id: 4, image: ismute ? Images.mic_mute : Images.mic, title: ismute ? "UnMute" : "Mute", disabled: isblock },
    ]
    return _SETTINGS;
  }
  render() {
    const { user } = this.state;
    const renderAction = (onPress, image) => (
      <View style={{ marginHorizontal: 10 }}>
        <BubbleImage onPress={onPress} source={image} size={24} padding={12} active={'default'} />
      </View>
    )
    return (
      <View style={[styles.container, styles.center]}>
        <Profile1
          user={user}
          show_state={!!user.state}
          onBackPress={this.onGoBack.bind(this)}
        />
        <ScrollView style={styles.settings}>
          <View style={[styles.setting_item, styles.center, { marginBottom: 30 }]}>
            <View style={styles.center}>
              <TouchableOpacity onPress={this.handlePhonePress.bind(this, user.phone)}>
                <Text whiteColor title3>{phoneformatter(user.phone)}</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                {renderAction(this.openChat.bind(this), Images.ic_chat)}
                {renderAction(this.openCall.bind(this, BaseConfig.CALL.VOICE), Images.call)}
                {renderAction(this.openCall.bind(this, BaseConfig.CALL.VIDEO), Images.video)}
              </View>
            </View>
          </View>
          {this.SettingsData.map(item => this.renderSettingItem(item))}
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
