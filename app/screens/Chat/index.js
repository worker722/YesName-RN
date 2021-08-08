import * as reduxActions from "@actions";
import { AttachToolbar, BubbleIcon, BubbleImage, ConfirmCall, Icon, MessageComponent, Profile, QuoteMessage, RecordAudio, Text } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import Clipboard from '@react-native-community/clipboard';
import { date2str, translate, videoThumbnail, getDeviceHeight } from "@utils";
import parsePhoneNumber from 'libphonenumber-js';
import moment from 'moment';
import React, { Component } from "react";
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Linking, Platform, TextInput, TouchableOpacity, View, RefreshControl } from "react-native";
import ActionSheet from 'react-native-actionsheet';
import RNContacts from 'react-native-contacts';
import DocumentPicker from 'react-native-document-picker';
import { GifSearch } from 'react-native-gif-search';
import ImagePicker from 'react-native-image-crop-picker';
import { swipeDirections } from 'react-native-swipe-gestures';
import { connect } from "react-redux";
import pathParse from 'path-parse';
import styles from "./styles";
const { CONTENTTYPE } = BaseConfig;
const { ApiActions, logger } = reduxActions;
const BOTTOMSPACE = 18;
const MESSAGESHOWCOUNT = 20;

class Chat extends Component {
  state = {
    profile_type: 0,
    chatMessage: '',
    visible_tools: false,
    visible_call_screen: false,
    visible_reaction_modal: false,
    attach: {
      data: null,
      type: CONTENTTYPE.TEXT,
    },
    visible_record_audio: false,
    cur_playing_audio: 0,
    gif_visible: false,
    show_bottom: false,
    actions: ["Quote", "Copy", "Cancel"],
    quote_message: 0,
    message_show_step: 1,
    sending: false,
    visited_messages: []
  }
  constructor(props) {
    super(props);
    this.onGoBack = this.onGoBack.bind(this);
    this.roomid = null;
    this.isForceBlur = false;
    this.focusmesage = 0;
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { route: { params: { roomid, messageid } } } = nextProps;
    if (roomid != this.roomid) {
      try {
        this.props.showLoading(false);
      } catch (error) {
      }
      this.roomid = roomid;
      this.updateChatRoom();
    }
    if (messageid > 0 && messageid != this.focusmesage) {
      this.focusmesage = messageid;
      this.scrollToId(messageid, true);
    }
  }
  onRefresh() {
    this.props.getChatRoom();
    this.props.getBlockList();
    this.props.getChatList();
  }
  updateChatRoom() {
    global.roomid = this.roomid;
    this.props.readMessages(this.roomid);
    try {
      clearInterval(this.timer);
      this.timer = null;
    } catch (error) {

    }
    this.timer = setInterval(() => {
      if (global.roomid == this.roomid) {
        this.props.readMessages(this.roomid);
      } else {
        clearInterval(this.timer);
      }
    }, 10000);
  }
  componentDidMount() {
    this.focusListener = this.props.navigation.addListener("focus", () => {
      this.isForceBlur = false;
      this.onRefresh();
      this.updateChatRoom();
    })
    this.blurListener = this.props.navigation.addListener("blur", () => {
      if (this.isForceBlur) return;
      if (this.props.app.security) {
        this.props.deleteRoom(this.roomid);
      }
      global.roomid = null;
      this.timer && clearInterval(this.timer);
    });
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
  }
  _keyboardDidShow(e) {
    if (this.state.visible_tools) {
      this.onToggleAttachTools(false);
    }
    this.scrollToBottom();
  }
  componentWillUnmount() {
    try {
      this.focusListener.remove();
      this.blurListener.remove();
    } catch (err) { }
    try {
      this.keyboardDidShowListener.remove();
    } catch (error) {
    }
  }
  onGoBack() {
    this.props.navigation.goBack();
  }
  onSwipe(direction, state) {
    const { SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;
    let { profile_type } = this.state;
    if (direction == SWIPE_RIGHT) {
      profile_type = profile_type == 2 ? 1 : profile_type == 1 ? 0 : 0;
    } else if (direction == SWIPE_LEFT) {
      profile_type = profile_type == 2 ? 2 : profile_type == 1 ? 2 : 1;
    } else {
      return;
    }
    this.setState({ profile_type });
  }
  submitChatMessage() {
    const { chatMessage, attach: { attach: data, type }, quoteid } = this.state;
    let content = chatMessage.trim();
    if (type == CONTENTTYPE.TEXT && !content) return;
    if (type != CONTENTTYPE.TEXT && !data) return;
    let attach = "";
    if (data) {
      if (typeof data == 'object') {
        attach = JSON.stringify(data);
      } else {
        attach = data;
      }
    }
    this.setState({ sending: true });
    const { auth: { user } } = this.props;
    content = content.replace(/'/g, "\\'");
    content = content.replace(/"/g, "\\\"");

    const message = {
      sender: user.id,
      roomid: this.roomid,
      content,
      type,
      attach,
      quoteid
    };
    this.props.sendMessage(message);
    this.setState({ chatMessage: "", sending: false, quoteid: 0, attach: { data: null, type: CONTENTTYPE.TEXT } });
  }
  getMessage(id = 0) {
    const { chat: { messages } } = this.props;
    if (id > 0) {
      let message = messages?.find(item => item.id == id);
      return message || {};
    }
    let message = messages?.filter(item => item.roomid == this.roomid);
    message = message.filter((ele, ind) => ind === message.findIndex(elem => elem.id === ele.id));
    message = message.sort((a, b) => a.id - b.id);
    if (id == -1) {
      return message.reverse()
    }
    const { message_show_step } = this.state;
    let startIndex = message.length - (message_show_step * MESSAGESHOWCOUNT);
    let chatMessages = message.slice(startIndex < 0 ? 0 : startIndex, message.length);
    if (startIndex > 0) {
      chatMessages = [{ id: -1 }, ...chatMessages];
    }
    // delete same id
    return chatMessages.reverse() || [];
  }
  async uploadFile(file) {
    let ext = file.name;
    try {
      const name_arr = file.name.split(".");
      ext = `.${name_arr[name_arr.length - 1]}`;
    } catch (error) {
    }
    try {
      file = { ...file, name: `${new Date().getTime()}${ext}` }
      const res = await this.props.uploadFile2Server(file, BaseConfig.UPLOADTYPE.CHAT);
      return res;
    } catch (err) {
    }
    return null;
  }
  async uploadSendFile(data, type, multiple = false) {
    if (!multiple && data.size) {
      const file_mb = data.size / 1000 / 1000;
      if (file_mb > BaseConfig.max_upload_size) {
        this.props.showToast(`${translate("The max file size is %1 MB", BaseConfig.max_upload_size)}`);
        return;
      }
    }
    this.setState({ sending: true });
    let url = '';
    let name = '';
    let thumbnail = '';
    let duration = 0;
    if (multiple) {
      let urls = await Promise.all(data.map(async item => ({ url: (await this.uploadFile(item)).path, name: item.name })));
      url = (urls || []).map(item => item.url).join(BaseConfig.URLSPLITTER);
      name = (urls || []).map(item => item.name).join(BaseConfig.URLSPLITTER);
    } else {
      const upload_res = await this.uploadFile(data);
      url = upload_res.path;
      duration = upload_res.duration;
      name = data?.name;
      if (type == CONTENTTYPE.VIDEO) {
        thumbnail = await videoThumbnail(url);
        if (thumbnail.path) {
          const thumbData = {
            name: `${new Date().getTime()}_thumb.png`,
            uri: thumbnail.path,
            type: 'image/png'
          }
          thumbnail.path = (await this.uploadFile(thumbData)).path;
        }
      }
    }
    if (url) {
      this.setState({ attach: { attach: { url, name, thumbnail, duration }, type } }, this.submitChatMessage.bind(this));
    }
  }
  async selectDocument(type) {
    if (type == CONTENTTYPE.FILE) {
      try {
        const res = await DocumentPicker.pick({
          type: [DocumentPicker.types.allFiles],
        });
        this.uploadSendFile(res, type);
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
        } else {
          throw err;
        }
      }
    } else {
      const options = {
        // mediaType: "photo",
        // cropping: true,
        // multiple: true
      };
      const response = async (image) => {
        const is_image = image.mime.indexOf("image") >= 0;
        this.isForceBlur = true;
        if (!is_image) {
          this.props.navigation.navigate("VideoViewer", {
            url: image.path,
            onDone: () => {
              const filename = `${(new Date).getTime()}.${image.mime.split("/")[1]}`;
              const file = {
                uri: image.path,
                size: image.size,
                type: image.mime,
                name: filename,
                fileCopyUri: image.path
              }
              this.uploadSendFile(file, CONTENTTYPE.VIDEO);
            }
          });
        } else {
          var images = [image];
          this.props.navigation.navigate("PreviewImage", {
            images: images.map(item => ({ ...item, path: `${Platform.OS == "android" ? "" : "file://"}${item.path}` })),
            onDone: (edited_images) => {
              let data = [];
              edited_images.forEach((image, _) => {
                const filename = `${(new Date).getTime()}.${image.mime.split("/")[1]}`;
                data.push({
                  uri: image.path,
                  size: image.size,
                  type: image.mime,
                  name: filename,
                  fileCopyUri: image.path
                });
              });
              this.uploadSendFile(data, CONTENTTYPE.IMAGE, true);
            }
          });
        }
      }
      ImagePicker.openPicker(options)
        .then(response)
        .catch(err => logger.error("select image", err))
      return;
    }
  }
  selectContact() {
    this.props.navigation.navigate("InviteFriends", {
      type: BaseConfig.INVITEPAGETYPE.SELECTCONTACTS, callback: res => {
        this.setState({ attach: { attach: res, type: CONTENTTYPE.CONTACTS } }, this.submitChatMessage.bind(this));
      }
    });
  }
  openCamera() {
    this.props.navigation.navigate("CustomCamera", {
      onResult: data => {
        const file = {
          type: data.mine || `${data.type == 0 ? "image" : "video"}/${data.ext.slice(1, data.ext.length)}`,
          name: `${new Date().getTime()}${data.ext}`,
          uri: data.uri
        };
        this.uploadSendFile(file, data.type == 0 ? CONTENTTYPE.IMAGE : CONTENTTYPE.VIDEO);
      },
      confirm_message: translate("Are you sure you want to send?")
    });
  }
  selectLocation() {
    this.props.navigation.navigate("CustomMapView", {
      onConfirm: (location) => {
        this.setState({ attach: { attach: location, type: CONTENTTYPE.LOCATION } }, this.submitChatMessage.bind(this));
      }
    })
  }
  selectGif() {
    this.setState({ gif_visible: true });
  }
  selectedGif(gif_url, gif_object) {
    const dims = gif_object.media[0].gif.dims;
    const preview = gif_object.media[0].gif.preview;
    this.setState({ attach: { attach: { url: gif_url, width: dims[0], height: dims[1], preview }, type: CONTENTTYPE.IMAGE } }, this.submitChatMessage.bind(this))
    this.setState({ gif_visible: false });
  }
  onConfirmCall(type) {
    this.onCancelCall();
    const user = this.getChatUser();
    const data = { userid: user.id, state: BaseConfig.CALLINGSTATE.INCOMING, type };
    this.isForceBlur = true;
    this.props.navigation.navigate("InOutCalling", { data })
  }
  onCancelCall() {
    this.setState({ visible_call_screen: false });
  }
  getChatUser() {
    const { users: { users }, chat: { joinusers } } = this.props;

    let room_users = joinusers?.filter(item => item.roomid == this.roomid);
    const user = users?.length > 0 ? users.find(item => item.id == room_users[0]?.userid) || {} : {};
    return user;
  }
  openReaction() {
    const user = this.getChatUser();
    this.props.navigation.navigate("CustomCamera", { type: BaseConfig.CAMERATYPE.CHATREACTION, userid: user.id });
  }
  changeSecurity() {
    const { app: { security }, chat: { rooms, joinusers } } = this.props;
    const chat_user_id = this.getChatUser()?.id;
    let join_rooms = rooms
      .map(item => {
        if (item.security == security) return null;
        return joinusers.find(join => join.roomid == item.roomid && join.userid == chat_user_id);
      })
      .filter(item => item);
    this.isForceBlur = true;
    if (security) {
      this.props.deleteRoom(this.roomid);
    }
    this.props.changeSecurity(!security);

    if (join_rooms?.length > 0 && join_rooms[0].roomid) {
      const roomid = join_rooms[0].roomid;
      this.props.navigation.navigate("Chat", { roomid });
      setTimeout(() => {
        this.isForceBlur = false;
      }, 2000);
    } else {
      this.props.showLoading(true);
      this.isForceBlur = false;
      global.chat_create_user = chat_user_id;
      this.props.createChat(chat_user_id);
    }
  }
  attachTools(type) {
    this.setState({ visible_tools: false });
    this.isForceBlur = true;
    switch (type) {
      case 0: //select file
        this.selectDocument(CONTENTTYPE.FILE);
        break;
      case 1: //select contact
        this.selectContact();
        break;
      case 2: //select location
        this.selectLocation();
        break;
      case 3: //select gif image
        this.isForceBlur = false;
        this.selectGif();
        break;
      case 4: //change security mode
        this.changeSecurity();
        break;
      case 5: //select video
        this.selectDocument();
        break;
      case 6: //select vidoe call
        this.onConfirmCall(BaseConfig.CALL.VIDEO);
        break;
      case 7: //voice call
        this.onConfirmCall(BaseConfig.CALL.VOICE);
        break;
      case 8: //take picture from camera
        this.openCamera();
        break;
      case 9: //reaction
        this.openReaction();
        break;
      default:
        logger.error("----invalid type----", type);
        break;
    }
  }
  onRecordedAd(url, filename) {
    const data = {
      name: filename,
      uri: url,
      type: 'audio/wav'
    }
    this.uploadSendFile(data, CONTENTTYPE.AUDIO);
  }
  onRecordAdError(err) {
    this.props.showToast("Audio recording failed. Check microphone permissions");
  }
  visibleRecordAudio(visible) {
    this.setState({ cur_playing_audio: 0, visible_record_audio: visible });
    Keyboard.dismiss();
  }
  onAudioPlay(id) {
    this.setState({ cur_playing_audio: id });
  }
  handleScroll(event) {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const show_bottom = contentOffset.y > layoutMeasurement.height / 2;
    if (this.state.show_bottom != show_bottom)
      this.setState({ show_bottom });
  }
  scrollToBottom() {
    if (this.scrollbottondisable) return;
    this.scrollView.scrollToOffset({ offset: 0, animated: true });
    setTimeout(() => {
      this.setState({ show_bottom: false });
    }, 500);
  }
  getActions(type) {
    const { sender, id: msgid } = this.message;
    const { auth: { user: { id: myid } }, chat: { favourites } } = this.props;
    const isfavourite = !!favourites?.find(item => item == msgid);
    const mine = sender == myid;
    let actions = [];
    switch (type) {
      case CONTENTTYPE.TEXT:
      case CONTENTTYPE.LOCATION:
        actions = ["Copy"];
        break;
      case CONTENTTYPE.FILE:
      case CONTENTTYPE.IMAGE:
      case CONTENTTYPE.VIDEO:
      case CONTENTTYPE.AUDIO:
      case CONTENTTYPE.REACTION:
      case CONTENTTYPE.REPLY_REACTION:
        actions = ["Download"];
        break;
      case CONTENTTYPE.CONTACTS:
        actions = ["Copy", "Save to contacts"];
        break;
      default:
        actions = [];
        break;
    }
    actions = ["Quote", "Forward", isfavourite ? "Remove from Favourite" : "Add to Favourite", ...actions, ...(mine ? ["Delete"] : []), "Cancel"];

    return actions;
  }
  onMsgAction(index) {
    let { attach, content, type, id, quoteid } = this.message;

    if (typeof attach == "string") {
      try {
        attach = JSON.parse(attach);
      } catch (error) {
      }
      attach = attach || {};
    }

    const actions = this.getActions(type);
    const action = actions[index];
    switch (action) {
      case "Quote":
        this.setState({ quoteid: id });
        break;
      case "Forward":
        this.forwardMessage();
        break;
      case "Copy":
        if (type == CONTENTTYPE.TEXT) {
          this.copyToClipboard(content);
        } else if (type == CONTENTTYPE.LOCATION) {
          this.copyToClipboard(attach.description || `${attach.latitude}° N, ${attach.longitude}° E`);
        } else if (type == CONTENTTYPE.CONTACTS) {
          this.copyToClipboard(`${attach.name || ''}\n${attach.phone || ''}`);
        }
        break;
      case "Download":
        this.onVisiteMessage(id);
        this.saveFile(attach);
        break;
      case "Save to contacts":
        this.onVisiteMessage(id);
        this.saveContacts(attach);
        break;
      case "Delete":
        this.deleteMessage();
        break;
      case "Add to Favourite":
        this.props.chatAddToFavourite(this.message.id);
        break;
      case "Remove from Favourite":
        this.props.chatRemoveFromFavourite(this.message.id);
        break;
      default:
        break;
    }
  }
  onVisiteMessage(msgid) {
    const { app: { security } } = this.props;
    if (!security) return;
    let { visited_messages } = this.state;
    if (visited_messages.find(item => item == msgid)) {
      return;
    }
    visited_messages.push(msgid);
  }
  longPressMessage(message) {
    const { type } = message;
    this.message = message;
    let actions = this.getActions(type);
    actions = actions.map(item => translate(item))
    this.setState({ actions });
    this.ActionSheet.show()
  }
  onPressReaction(message, isanswer) {
    this.isForceBlur = true;
    if (!isanswer) {
      this.props.navigation.navigate("PreviewReaction", { message });
      return;
    }
    if (message.sender == ApiActions._CURRENTUSERID()) return;
    this.props.navigation.navigate("Reaction", { ...message });
  }
  saveContacts(data) {
    this.isForceBlur = true;
    const phone1 = parsePhoneNumber(data.phone, 'CH');
    var newPerson = {
      displayName: data.name,
      phoneNumbers: [{ label: "Mobile", number: phone1.number }]
    }
    RNContacts.openContactForm(newPerson);
  }
  copyToClipboard(text) {
    Clipboard.setString(text);
    this.props.showToast("Copied text to clipboard.")
  };
  async saveFile(attach) {
    let urls = attach.url.split(BaseConfig.URLSPLITTER);
    let names = attach.name?.split?.(BaseConfig.URLSPLITTER);
    if (!names || names.length <= 0) {
      names = urls.map(item => {
        const path = pathParse(item);
        return path.base;
      });
    }
    this.props.showLoading(true, "Downloading...");
    let downloaded_urls = await Promise.all(urls.map(async (url, index) => await this.props.downloadFile(names[names.length > index ? index : 0], url, true, true)));
    this.props.showLoading(false);
    this.props.showToast(`${translate('Download is done!')} \n ${downloaded_urls.join("\n")}`);
  }
  deleteMessage() {
    this.props.showAlert({
      title: "Confirm",
      message: "Do you really want to delete this chat?",
      textConfirm: "Yes",
      textCancel: "No",
      visible: true,
      onConfirm: () => {
        const user = this.getChatUser();
        this.props.deleteMessage(this.message.id, user?.id);
      },
    })
  }
  forwardMessage() {
    this.isForceBlur = true;
    this.props.navigation.navigate("InviteFriends", {
      type: BaseConfig.INVITEPAGETYPE.FORWARD,
      callback: receiver => {
        try {
          if (!(receiver > 0)) return;
          const { auth: { user } } = this.props;
          const { id: msgid, attach: msgattach, content: msgcontent, quoteid: msgquoteid, type: msgtype } = this.message;
          var quoteid = msgid;
          if (!msgattach && !msgcontent && msgtype == CONTENTTYPE.FORWARD) {
            quoteid = msgquoteid;
          }
          const message = {
            sender: user.id,
            receiver,
            roomid: null,
            content: '',
            type: CONTENTTYPE.FORWARD,
            attach: '',
            quoteid
          };
          this.props.sendMessage(message);
        } catch (error) {
          logger.error("forward message error", error);
        }
      }
    });
  }
  renderDate(allmsg, curmsg, index) {
    if (curmsg.id == -1) return;
    let date = null;
    const last_msg = index == allmsg.length - 1;
    if (last_msg) {
      date = curmsg.created_at;
    } else if (moment(curmsg?.created_at).isAfter(allmsg[index + 1]?.created_at, 'day')) {
      date = curmsg?.created_at;
    }
    if (date == null) return;
    return (
      <View style={[styles.dateline, { marginTop: last_msg ? 10 : -6 }]}>
        <Text whiteColor style={styles.date}>{date2str(date, 2)}</Text>
      </View>
    );
  }
  erronum = 0;
  scrollToId(msgid, force = false) {
    const message_show_step = this.state.message_show_step;
    this.props.showLoading(true);
    if (!this.errornum) this.errornum = 0;
    this.errornum++;
    try {
      const allMessags = this.getMessage(-1);
      const index = allMessags.findIndex(item => item.id == msgid);

      if (index > message_show_step * MESSAGESHOWCOUNT) {
        var steps = Math.ceil(index / MESSAGESHOWCOUNT);
        this.errornum = 0;
        this.setState({ message_show_step: steps }, () => {
          setTimeout(() => {
            this.scrollToId(msgid, force);
          }, 1000);
        });
        return;
      }
      if (this.scrollView) {
        this.scrollView.scrollToIndex({ index, animated: true });
        this.props.showLoading(false);
        this.errornum = 0;
        return;
      }
    } catch (error) {
      logger.error("scroll", error);
    }
    if (force && this.errornum < 10) {
      setTimeout(() => {
        this.scrollToId(msgid, force);
      }, 1000);
    } else {
      this.props.showLoading(false);
    }
  }
  onPressAvatar() {
    const chat_user = this.getChatUser();
    this.isForceBlur = true;
    this.props.navigation.navigate("UserProfile", { userid: chat_user.id, roomid: this.roomid });
  }
  onToggleAttachTools(dismisskeyboard = true) {
    const { visible_tools } = this.state;
    this.setState({ visible_tools: !visible_tools });
    if (dismisskeyboard) {
      Keyboard.dismiss();
    }
  }
  async keyboardImageChange({ nativeEvent }) {
    try {
      const { linkUri, uri, mime } = nativeEvent;
      if (!linkUri && uri) {
        const path = pathParse(uri);
        const file = {
          name: path.base,
          uri: uri,
          type: mime,
        }
        this.uploadSendFile(file, CONTENTTYPE.IMAGE);
        return;
      } else if (linkUri) {
        this.setState({ attach: { attach: { url: linkUri }, type: CONTENTTYPE.IMAGE } }, this.submitChatMessage.bind(this))
      } else {
        logger.error("keyboard image error2", error);
        this.props.showToast("Detected error 2, please log report on profile page.");
        return;
      }
    } catch (error) {
      logger.error("keyboard image error", error);
      this.props.showToast("Detected error, please log report on profile page.");
      return;
    }
  }
  render() {
    const { app: { security } } = this.props;
    const { profile_type, chatMessage, sending, visible_tools, visible_call_screen, visible_record_audio, cur_playing_audio, gif_visible, show_bottom, actions, quoteid, message_show_step, visited_messages } = this.state;
    const allMessags = this.getMessage();
    return (
      <KeyboardAvoidingView behavior={"padding"} style={styles.container} enabled={Platform.OS === "ios"}>
        <View
          // onSwipe={(direction, state) => this.onSwipe(direction, state)}
          // config={config}
          style={styles.contain}
        >
          <Profile
            security={security}
            profile_type={profile_type}
            onGoBack={this.onGoBack.bind(this)}
            user={this.getChatUser()}
            security={security}
            onPressAvatar={this.onPressAvatar.bind(this)}
          />
          {profile_type != 2 &&
            <>
              <FlatList
                ref={(view) => this.scrollView = view}
                onScroll={this.handleScroll.bind(this)}
                keyboardShouldPersistTaps={'always'}
                style={{ flex: 1 }}
                data={allMessags}
                refreshControl={
                  <RefreshControl
                    colors={[BaseColor.primaryColor]}
                    refreshing={false}
                    onRefresh={this.onRefresh.bind(this)} />
                }
                inverted
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <>
                    {item.id == -1 ?
                      <View style={{ alignItems: "center", justifyContent: "center", padding: 5 }}>
                        <TouchableOpacity
                          onPress={() => {
                            this.scrollbottondisable = true;
                            this.setState({ message_show_step: message_show_step + 1 });
                            clearTimeout(this.scrolltimer);
                            this.scrolltimer = setTimeout(() => {
                              this.scrollbottondisable = false;
                            }, 3000);
                          }}
                          style={{ padding: 8, backgroundColor: BaseColor.blackOpacity, borderRadius: 4 }}>
                          <Text subhead whiteColor>Load more</Text>
                        </TouchableOpacity>
                      </View>
                      :
                      <MessageComponent
                        onVisiteMessage={this.onVisiteMessage.bind(this, item.id)}
                        onPreviewMessage={() => this.isForceBlur = true}
                        cur_playing_audio={cur_playing_audio}
                        navigation={this.props.navigation}
                        isVisited={security && visited_messages?.find?.(visited_msgid => visited_msgid == item.id)}
                        quote={
                          (item.quoteid > 0 && item.type != CONTENTTYPE.STORY && item.type != CONTENTTYPE.REACTION && item.type != CONTENTTYPE.REPLY_REACTION) ?
                            this.getMessage(item.quoteid)
                            : null
                        }
                        message={item}
                        disableLongPress={item.type == CONTENTTYPE.STORY}
                        onAudioPlay={() => this.onAudioPlay(item.id)}
                        onLongPress={this.longPressMessage.bind(this, item)}
                        onPressReaction={this.onPressReaction.bind(this)}
                        onQuotePress={() => this.scrollToId(item.quoteid)}
                      />
                    }
                    {this.renderDate(allMessags, item, index)}
                  </>
                )}
              />
              {show_bottom &&
                <View style={{ position: "absolute", bottom: 90, right: 10 }}>
                  <TouchableOpacity
                    activeOpacity={.9}
                    onPress={this.scrollToBottom.bind(this)}
                    style={{ width: 50, height: 50, backgroundColor: BaseColor.blackOpacity, borderRadius: 999, justifyContent: "center", alignItems: "center" }}>
                    <Icon name={'angle-down'} size={30} color={BaseColor.whiteColor} />
                  </TouchableOpacity>
                </View>
              }
              {visible_tools &&
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={this.onToggleAttachTools.bind(this)}
                  style={{ flex: 1, position: "absolute", backgroundColor: BaseColor.blackOpacity2, top: 0, left: 0, bottom: 0, right: 0 }}
                />
              }
              <>
                <QuoteMessage
                  message={this.getMessage(quoteid)}
                  showClose
                  style={{ marginBottom: -10, }}
                  onRemoveQuote={() => {
                    this.setState({ quoteid: 0 });
                  }} />
                <AttachToolbar
                  visible_tools={visible_tools}
                  security={security}
                  attachTools={this.attachTools.bind(this)}
                />
                <View
                  style={{
                    padding: 8,
                    backgroundColor: BaseColor.whiteColor,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    paddingBottom: Platform.OS == "android" ? 8 : BOTTOMSPACE
                  }}
                >
                  <BubbleImage onPress={this.onToggleAttachTools.bind(this)} source={Images[visible_tools ? "minus" : "plus"]} width={23} height={23} active={"default1"} />
                  <BubbleImage onPress={this.visibleRecordAudio.bind(this, true)} source={Images.mic} width={23} height={23} active={"default1"} />
                  <View style={{ flex: 1, padding: 8, paddingHorizontal: 15, marginHorizontal: 5, backgroundColor: "#b2e7e7", borderRadius: 20 }}>
                    <TextInput
                      multiline={true}
                      placeholderTextColor={BaseColor.blackColor}
                      style={[{ maxHeight: 80, margin: 0, padding: 0 }, Platform.OS == "ios" && { marginBottom: 4 }]}
                      placeholder={translate("Type message here...")}
                      onChangeText={chatMessage => this.setState({ chatMessage })}
                      value={chatMessage}
                      onImageChange={this.keyboardImageChange.bind(this)}
                    />
                  </View>
                  {sending ?
                    <BubbleIcon size={23} padding={10} renderContent={<ActivityIndicator size={"small"} color={BaseColor.grayColor} />} />
                    :
                    <BubbleImage onPress={this.submitChatMessage.bind(this)} source={Images.send} width={23} height={23} active={"default1"} />
                  }
                </View>
              </>
            </>
          }
        </View>
        {gif_visible &&
          <View
            style={{
              backgroundColor: BaseColor.primaryColor,
              position: "absolute",
              width: "100%",
              height: Platform.OS == "android" ? "100%" : getDeviceHeight(),
              paddingTop: 20,
            }}>
            <View style={{ width: "100%", justifyContent: "flex-end", alignItems: "flex-end", padding: 20, paddingBottom: 0, zIndex: 9999 }}>
              <TouchableOpacity onPress={() => this.setState({ gif_visible: false })}>
                <Icon name={"times"} size={25} color={BaseColor.whiteColor} />
              </TouchableOpacity>
            </View>
            <GifSearch
              visible={gif_visible}
              onBackPressed={() => this.setState({ gif_visible: false })}
              style={{ backgroundColor: BaseColor.transparent, marginTop: -20 }}
              tenorApiKey={global.config?.tenor_key}
              maxGifsToLoad={99999999}
              textInputStyle={{ fontWeight: 'bold', color: BaseColor.whiteColor, borderBottomWidth: 3, fontSize: 16, borderBottomColor: BaseColor.whiteColor }}
              gifListStyle={{ marginTop: 40 }}
              numColumns={3}
              loadingSpinnerColor={BaseColor.whiteColor}
              placeholderTextColor={BaseColor.whiteColor}
              placeholderText={translate('Search')}
              onGifSelected={this.selectedGif.bind(this)}
              onGifLongPress={(gif_url, gif_object) => Linking.openURL(gif_object.url)}
              showScrollBar={false}
              noGifsFoundText={translate("No Gifs found")}
              noGifsFoundTextStyle={{ fontWeight: 'bold', color: BaseColor.whiteColor }}
              provider={"tenor"}
              textInputProps={{ autoFocus: true }}
              onError={(error) => { logger.error("tenor error: ", error) }}
            />
          </View>
        }
        <RecordAudio
          visible={visible_record_audio}
          onConfirm={this.onRecordedAd.bind(this)}
          onError={this.onRecordAdError.bind(this)}
          onClose={this.visibleRecordAudio.bind(this, false)}
        />
        <ConfirmCall
          visible={visible_call_screen}
          user={this.getChatUser()}
          onConfirm={this.onConfirmCall.bind(this)}
          onCancel={this.onCancelCall.bind(this)}
        />
        <ActionSheet
          ref={o => this.ActionSheet = o}
          options={actions || []}
          cancelButtonIndex={actions?.length - 1 || 0}
          onPress={this.onMsgAction.bind(this)}
        />
      </KeyboardAvoidingView>
    );
  }
}
const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
