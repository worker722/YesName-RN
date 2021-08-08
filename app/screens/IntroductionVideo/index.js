import * as reduxActions from "@actions";
import { Text } from "@components";
import { BaseColor } from "@config";
import { checkString, getDeviceHeight, getDeviceWidth, image_uri } from "@utils";
import React, { Component } from "react";
import { TouchableOpacity, View } from "react-native";
import KeepAwake from 'react-native-keep-awake';
import VideoPlayer from 'react-native-video-player';
import { connect } from "react-redux";
import styles from "./styles";
const { ApiActions } = reduxActions;
class IntroductionVideo extends Component {
  constructor(props) {
    super(props);
    this.visitIntro();
    this.video_url = global.config?.introduction;
    if (checkString(this.video_url)) return;
    this.skip();
  }
  visitIntro() {
    ApiActions.updateUser(this.props.auth.user.id, { visit_intro: 1 })
      .then(res => {
        this.props.getMyInfo();
      })
      .catch(err => { })
  }
  componentDidMount() {
    this.props.destroyView();
  }
  onBuffer = ({ isBuffering }) => {
    this.props.showLoading(isBuffering);
  }
  onLoadStart = () => {
    this.props.showLoading(true);
  }
  onLoad = () => {
    this.props.showLoading(false);
  }
  skip() {
    const { navigation: { navigate } } = this.props;
    if (this.props.auth.user?.visit_invite != 1)
      return navigate("InviteFriends");
    navigate("Main");

  }
  render() {
    return (
      <View style={styles.container}>
        <KeepAwake />
        <VideoPlayer
          autoplay={true}
          onBuffer={this.onBuffer.bind(this)}
          onLoadStart={this.onLoadStart.bind(this)}
          onLoad={this.onLoad.bind(this)}
          onEnd={this.skip.bind(this)}
          video={image_uri(this.video_url)}
          style={{ backgroundColor: BaseColor.blackColor, width: getDeviceWidth(true), height: getDeviceHeight(true) }}
          controlsTimeout={2000}
          resizeMode={'cover'}
          hideControlsOnStart={true}
        />
        <TouchableOpacity style={styles.skip_button} onPress={this.skip.bind(this)}>
          <Text whiteColor title2 bold>{"Skip"}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(IntroductionVideo);
