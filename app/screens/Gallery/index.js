import * as reduxActions from "@actions";
import { Avatar, BubbleImage, CustomTabBar, Header, Icon, PhotoGrid, Text } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import { comparePhone, translate, videoThumbnail } from "@utils";
import React, { Component } from "react";
import { AppState, FlatList, TouchableOpacity, View, Image } from "react-native";
import { Overlay } from 'react-native-elements';
import RNVoipCall from 'react-native-voip-call';
import { connect } from "react-redux";
import styles from "./styles";

const { ApiActions, logger } = reduxActions;
class Gallery extends Component {
  constructor(props) {
    super(props);
    this.onGoBack = this.onGoBack.bind(this);
    this.renderFriends = this.renderFriends.bind(this);
    this.showStories = this.showStories.bind(this);
    this.onOpenCamera = this.onOpenCamera.bind(this);
    this.showMyStories = this.showMyStories.bind(this);
    this.addToFavourite = this.addToFavourite.bind(this);
    this.onLongPress = this.onLongPress.bind(this);

    this.state = {
      gallery_favorite: false,
      short_actions: false
    }
  }
  async openDirect() {
    try {
      RNVoipCall.endAllCalls();
    } catch (error) {

    }
    if (global.calling_user) {
      const checkRes = await ApiActions.checkChatRoom(global.calling_user?.roomid);
      const { success, room } = checkRes;
      if (success && room?.state == 0) {
        if (!global.displayedIncom) {
          global.answer = false;
        }
        global.displayedIncom = false;
        const data = { data: global.calling_user, answer: global.answer, forceEnd: true };
        this.props.navigation.navigate("InOutCalling", data);
      }
    } else if (global.openRoomId) {
      const roomid = global.openRoomId;
      global.openRoomId = null;
      this.props.navigation.navigate("Chat", { roomid });
      return;
    }
  }
  componentDidMount() {
    this.openDirect();
    this.props.destroyView();

    this.props.listenChangeStory(this.refresh.bind(this));
    this.props.listenVisitedMyStory();
    this.props.receiveMessage();
    this.props.listenChatList();
    this.props.listenBlockList();
    this.props.listenIncoming();
    this.props.initFcmToken();
    this.props.listenMissedCalls();
    this.props.getMyStory(true);
    this.stopTimer();
    this.timer = setInterval(this.refresh.bind(this), 60000);
    AppState.addEventListener("change", this.handleAppStateChange);
    this.focusListener = this.props.navigation.addListener("focus", () => {
      this.props.getVisitedStories();
      ApiActions.getVisitedMyStory();
      this.refresh();
    });
    setTimeout(() => {
      ApiActions.getVisitedMyStory();
      this.props.getVisitedStories();
      this.props.getChatRoom();
      this.props.getChatList();
    }, 500);
  }
  refresh(isLoading = false) {
    this.props.initTokens();
    this.props.getMissedCalls();
    this.props.getContacts(isLoading);
    this.props.getStories(isLoading);
    this.props.getGallery(isLoading);
  }
  componentWillUnmount() {
    try {
      this.focusListener.remove();
      this.focusListener = null;
      AppState.removeEventListener("change", this.handleAppStateChange);
    } catch (err) { }
    this.stopTimer();
  }
  stopTimer() {
    try {
      clearInterval(this.timer);
      this.timer = null;
    } catch (error) {

    }
  }
  handleAppStateChange = (nextAppState) => {
    if (nextAppState == "active") {
      this.openDirect();
    }
  };
  componentDidUpdate(props, state) {
    const { app: { next, pendingpage } } = this.props;
    if (pendingpage) {
      this.props.goNextSuccess();
      this.props.navigation.navigate(next.page, next.params);
      if (next.page == "Gallery") {
        const gallery_favorite = next.params?.favourite;
        this.setState({ gallery_favorite });
      }
    }
  }
  onOpenCamera() {
    this.props.navigation.navigate("CustomCamera", {
      onResult: this.choosedMedia.bind(this),
      confirm_message: "confirm-post"
    });
  }
  onGoBack() {
    this.props.navigation.goBack();
  }
  async showStories(story) {
    const { users: { users }, stories: { visited_stories } } = this.props;
    const user = users.find(item => item.id == story.userid);
    let visited_story = visited_stories?.find(visited_story_item => visited_story_item.storyid == story.storyid) || {};
    this.props.navigation.navigate("StoryView", { type: 0, user, storyid: story.storyid, visited_story });
  }
  showMyStories() {
    this.props.getVisitedStories();
    const { stories: { mystory: { gallery, story }, visited_stories }, auth: { user } } = this.props;
    if (!gallery || gallery.length <= 0)
      return;
    let visited_story = visited_stories?.find(visited_story_item => visited_story_item.storyid == story.id) || {};
    this.props.navigation.navigate("StoryView", { type: 1, user, storyid: story.id, visited_story });
  }
  async addStory(image, type) {
    await ApiActions.addStoryMedia({ image, type });
    this.props.showLoading(false);
    this.props.getMyStory(true);
  }
  async choosedMedia(data) {
    this.props.showLoading(true, "Saving...");
    const filename = new Date().getTime();
    const choose_image = {
      type: data.mine || `${data.type == 0 ? "image" : "video"}/${data.ext.slice(1, data.ext.length)}`,
      name: `${filename}${data.ext}`,
      uri: data.uri
    };
    let res = await this.props.uploadFile2Server(choose_image, BaseConfig.UPLOADTYPE.GALLERY);
    if (res.success) {
      let thumbnail = {};
      if (data.type != 0) {
        thumbnail = await videoThumbnail(res.path);
        const thumbfile = {
          name: `${filename}_thumb.png`,
          uri: thumbnail.path,
          type: 'image/png'
        };
        const upload_res = await this.props.uploadFile2Server(thumbfile, BaseConfig.UPLOADTYPE.GALLERY);
        if (upload_res?.path) {
          res.path = `${res.path}${BaseConfig.URLSPLITTER}${upload_res?.path}`;
        }
      }
      this.addStory(res.path, data.type);
    }
  }
  renderFriends({ item, index }) {
    return (
      <View style={styles.story_item}>
        <View style={[styles.story_border, (!item.visited_story?.visited && item.id != 0) && { borderColor: BaseColor.primaryBorderColor }]}>
          {item.id == 0 ?
            <TouchableOpacity onPress={this.onOpenCamera} activeOpacity={.8}>
              <BubbleImage active={"default"} source={Images.ic_add_story} size={28} padding={12} disable />
            </TouchableOpacity>
            :
            <Avatar user={item} size={50} onPress={() => this.showStories(item)} />
          }
        </View>
        <Text body2 whiteColor style={{ marginTop: 2, maxWidth: 80, textAlign: "center" }}>{item.name}</Text>
      </View>
    )
  }
  get getFriends() {
    const { users: { users }, auth: { user: { id: curuserid } }, stories: { stories, visited_stories } } = this.props;
    let data = stories.map(item => {
      if (item.userid == curuserid) return null;
      const some_user = users?.find(v => comparePhone(v.phone, item.phone));
      if (!some_user?.fromContacts) return null;
      item.visited_story = visited_stories?.find(visited_story_item => visited_story_item.storyid == item.storyid) || {};
      return { ...item, ...some_user };
    });
    data = data.filter(item => item);
    const toint = (v) => parseInt(v) || 0;
    data = data.sort((a, b) => toint(a.visited_story?.visited) - toint(b.visited_story?.visited));
    // data = [{ id: 0, name: "Add Story" }, ...data];
    return data;
  }
  addToFavourite(type) {
    const { fav } = this.activeReaction;
    const { id: reactionid } = this.activeReaction;

    const message = type == 1 ? "Delete reaction from gallery? \n You can\'t restore this action." : fav ? "Remove from the favourite?" : "Add to favourite?";
    const textConfirm = type == 1 ? "Yes, Sure!" : fav ? "Remove" : "Add";

    this.props.showAlert({
      title: "Confirm",
      message,
      textConfirm,
      visible: true,
      onConfirm: () => {
        if (type == 1) {
          this.props.hideReaction(reactionid);
          this.props.showToast("Successfully deleted reaction from gallery");
          return;
        }
        if (fav) {
          this.props.removeFromFavourite(reactionid);
        } else {
          this.props.addToFavourite(reactionid);
        }
        const toast_msg = fav ? "Successfully removed from favourite" : "Successfully added to favourite";
        this.props.showToast(toast_msg);
      }
    })
    return;
  }
  onLongPress(activeReaction) {
    this.activeReaction = activeReaction;
    this.setState({ short_actions: true });
  }
  hideShot() {
    this.setState({
      short_actions: false
    })
  }
  async saveReaction() {
    const { attach: { name, url } } = this.activeReaction;
    this.props.showLoading(true, "Downloading...");
    const path = await this.props.downloadFile(name, url, false, true);
    this.props.showLoading(false);
    this.props.showToast(`${translate('Download is done!')} \n ${path}`);
  }
  pressAction(act) {
    this.hideShot();
    switch (act) {
      case 0:
        this.saveReaction();
        break;
      case 1:
      case 2:
        this.addToFavourite(act);
        break;
      default:
        break;
    }
  }
  render() {
    const { stories: { mystory: { gallery: myGallery } }, auth: { user } } = this.props;
    const { gallery_favorite, short_actions } = this.state;
    return (
      <View style={styles.container}>
        <Header
          showLogo
          renderRight={
            <View style={[styles.story_border, { borderColor: myGallery?.length > 0 ? BaseColor.primaryBorderColor : BaseColor.transparent }]}>
              <Avatar user={user} size={45} onPress={this.showMyStories} style={styles.avatar} />
            </View>
          }
          renderLeft={<BubbleImage active={"default"} source={Images.ic_add_story} size={28} padding={12} onPress={this.onOpenCamera.bind(this)} />}
          onPressLeft={this.onOpenCamera.bind(this)}
        />
        <View style={styles.contain}>
          <View style={styles.stories}>
            <FlatList
              data={this.getFriends}
              keyExtractor={item => item.id.toString()}
              renderItem={this.renderFriends}
            />
          </View>
          <View style={styles.gallery}>
            <CustomTabBar
              tabLabels={["All", "Favorite"]}
              active={gallery_favorite ? 1 : 0}
              onPress={(index) => this.setState({ gallery_favorite: index == 0 ? false : true })}
            />
            <PhotoGrid
              onRefresh={this.refresh.bind(this, true)}
              show_favourite={gallery_favorite}
              onLongPress={this.onLongPress}
              onPress={(message) => {
                this.props.navigation.navigate("PreviewReaction", { message });
              }}
            />
          </View>
        </View>
        <Overlay isVisible={short_actions} overlayStyle={styles.overlay} onBackdropPress={this.hideShot.bind(this)} >
          <TouchableOpacity style={[styles.action]} onPress={this.pressAction?.bind(this, 0)}>
            <Text title2 bold style={{ color: "#32e8eb" }}>{"Save"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.action, { marginVertical: 3 }]} onPress={this.pressAction?.bind(this, 1)}>
            <Text title2 bold style={{ color: "#32e8eb" }}>{"Remove"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.action]} onPress={this.pressAction?.bind(this, 2)}>
            <Text title2 bold style={{ color: "#32e8eb" }}>{this.activeReaction?.fav ? "Remove from ⭐" : "Add to ⭐"}</Text>
          </TouchableOpacity>
          <View style={styles.close}>
            <TouchableOpacity onPress={this.hideShot.bind(this)}>
              <Icon name={'closecircle'} color={BaseColor.whiteColor} size={35} type={"AntDesign"} />
            </TouchableOpacity>
          </View>
        </Overlay>
      </View>
    );
  }
}


const mapStateToProps = (state) => (state)
const mapDispatchToProps = {
  ...reduxActions
}
export default connect(mapStateToProps, mapDispatchToProps)(Gallery);