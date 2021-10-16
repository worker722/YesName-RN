import * as reduxActions from "@actions";
import { FadeInOut, Icon, Image, RecordingButton, Text } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import ImageEditor from "@react-native-community/image-editor";
import { getDeviceHeight, getDeviceWidth, image_uri, translate, videoThumbnail } from "@utils";
import pathParse from 'path-parse';
import React, { Component } from "react";
import { AppState, ImageBackground, Platform, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { Overlay } from 'react-native-elements';
import RNFS from "react-native-fs";
import ImagePicker from 'react-native-image-crop-picker';
import KeepAwake from 'react-native-keep-awake';
import PhotoEditor from 'react-native-photo-editor';
import PhotoEditSDK from "react-native-photoedit-sdk";
import { connect } from "react-redux";
import styles from "./styles";

const { ApiActions, logger } = reduxActions;
const _WIDTH = getDeviceWidth();
const _HEIGHT = getDeviceHeight();
const { CAMERATYPE } = BaseConfig;
class CustomCamera extends Component {
  state = {
    flash: 'off',
    type: 'back',
    isRecording: false,
    active_flash: false,
    recordingTime: 0,
    ratio: {
      height: 16,
      width: 9,
      available: [],
      full: false,
      ratio_preview: false
    },
    autoFocusPoint: {
      normalized: { x: 0.5, y: 0.5 }, // normalized values required for autoFocusPointOfInterest
      drawRectPosition: {
        x: _WIDTH * 0.5 - 32,
        y: _HEIGHT * 0.5 - 32,
        autoExposure: true
      },
    },
    dialog: {
      visible: false,
      type: 0
    },
    visibleWhite: false
  };
  constructor(props) {
    super(props);
    let { route: { params } } = this.props;
    this.params = params;
    this.camera_type = this.params?.type || CAMERATYPE.EDITCAMERA;
  }
  componentDidMount() {
    AppState.addEventListener("change", this.handleAppStateChange);
  }
  componentWillUnmount() {
    try {
      AppState.removeEventListener("change", this.handleAppStateChange);
      this.handleAppStateChange.remove();
    } catch (error) {
    }
  }
  handleAppStateChange = (nextAppState) => {
    switch (nextAppState) {
      case "active":
        this.setState({ inBackground: false })
        break;
      case "background":
      case "inactive":
        this.setState({ inBackground: true })
        break;
      default:
    }
  };
  toggleFacing() {
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back',
    });
  }
  toggleFlashList() {
    this.setState({ active_flash: !this.state.active_flash });
  }
  preTakePicture() {
    this.unvisibleFrontFlash = this.state.type == "back" || this.state.flash == "off";
    if (this.unvisibleFrontFlash) {
      this.takePicture();
      return;
    }
    this.frontFlash(true, () => {
      this.takePicture();
    })
  }
  frontFlash(isOn, callback) {
    if (this.unvisibleFrontFlash) return;
    this.setState({ visibleWhite: isOn }, () => {
      setTimeout(() => {
        callback?.()
      }, 100);
    });
  }
  async takePicture() {
    if (this.camera) {
      const options = {
        quality: 1,
        skipProcessing: false,
        fixOrientation: true
      };

      const capturedImg = await this.camera.takePictureAsync(options);
      this.frontFlash(false);
      const { uri, width, height } = capturedImg;
      if (!this.state.ratio?.full) {
        this.editImage(uri);
        return;
      }
      const _PORTLAT = width > height;
      const h_rat = height / _HEIGHT;
      const w_rat = width / _WIDTH;
      const rat = h_rat < w_rat ? h_rat : w_rat;
      let resize_width = _WIDTH * rat;
      let resize_height = _HEIGHT * rat;
      if (_PORTLAT) {
        let tmp = resize_height;
        resize_height = resize_width;
        resize_width = tmp;
      }
      resize_height *= 2;
      resize_width *= 2;
      const cropData = {
        offset: { x: 0, y: 0 },
        size: { width, height },
        displaySize: { width: resize_width, height: resize_height },
        resizeMode: 'cover',
      };
      const url = await ImageEditor.cropImage(uri, cropData);
      this.editImage(url);
    };
  };
  SelectUser(callback) {
    this.props.navigation.navigate("InviteFriends", { type: BaseConfig.INVITEPAGETYPE.REACTION, callback });
  }
  doneEdit() {
    const { app: { security } } = this.props;
    if (this.camera_type == CAMERATYPE.EDITCAMERA) {
      this.params?.onResult(this.data);
      this.onClose();
      return;
    } else if (this.camera_type == CAMERATYPE.CHATREACTION && security) {
      this.onSendReaction(this.params.userid, true, true);
    } else {
      const type = this.camera_type == CAMERATYPE.CHATREACTION || this.camera_type == CAMERATYPE.SETTINGREACTION ? 1 : 0;
      this.visibleDialog(true, type);
    }
  }
  onDoneEdit(data) {
    this.data = data;
    if (data.type == 0) {
      return this.doneEdit();
    }

    this.props.navigation.navigate("VideoViewer", {
      ...image_uri(data.uri, "url"),
      onClose: this.onClose.bind(this),
      onDone: this.doneEdit.bind(this)
    })
  }
  visibleDialog(visible, type) {
    this.setState({ dialog: { visible, type } })
  }
  async onSendReaction(userid, isReaction = true, ishidden) {
    const ISSTORY = (userid == null);
    this.props.showLoading(true, "Sending...");
    const data = this.data;
    const filename = new Date().getTime();
    const choose_image = {
      type: data.mine || `${data.type == 0 ? "image" : "video"}/${data.ext.slice(1, data.ext.length)}`,
      name: `${filename}${data.ext}`,
      uri: data.uri
    };
    const media_type = ISSTORY ? BaseConfig.UPLOADTYPE.GALLERY : BaseConfig.UPLOADTYPE.CHAT;
    const res = await this.props.uploadFile2Server(choose_image, media_type);
    if (!res) {
      this.props.showLoading(false);
      return;
    }
    let thumbnail = {};
    if (data.type != 0) {
      try {
        thumbnail = await videoThumbnail(res.path);
        const thumbfile = {
          name: `${filename}_thumb.png`,
          uri: thumbnail.path,
          type: 'image/png'
        };
        const thumbtype = ISSTORY ? BaseConfig.UPLOADTYPE.GALLERY : BaseConfig.UPLOADTYPE.CHAT;
        const upload_res = await this.props.uploadFile2Server(thumbfile, thumbtype);
        thumbnail.path = upload_res?.path;
      } catch (error) {
      }
    }
    if (ISSTORY) {
      const uploaded_path = `${res.path}${thumbnail.path ? BaseConfig.URLSPLITTER : ''}${thumbnail.path || ''}`;
      this.addStory(uploaded_path, data.type);
      this.props.showLoading(false);
      this.props.navigation.goBack();
      return;
    }

    let attach = JSON.stringify({ url: res.path, name: res.name, type: data.type, thumbnail });
    let message = {}
    const type = isReaction ? BaseConfig.CONTENTTYPE.REACTION : data.type == 0 ? BaseConfig.CONTENTTYPE.IMAGE : BaseConfig.CONTENTTYPE.VIDEO;
    message = {
      sender: ApiActions._CURRENTUSERID(),
      receiver: userid,
      content: '',
      type,
      attach,
      security: ishidden,
      etc: isReaction ? (ishidden ? 2 : 0) : '' //0: normal, 1: visited normal, 2: hidden reaction, 3: visited hidden
    }
    // user
    this.props.sendMessage(message);
    this.props.showLoading(false);
    this.props.navigation.goBack();
  }
  async addStory(image, type) {
    await ApiActions.addStoryMedia({ image, type });
    this.props.showLoading(false);
    this.props.getMyStory(true);
  }
  pressAction(index) {
    const { dialog: { type } } = this.state;
    this.visibleDialog(false, type);
    if (index == 2) {
      this.onSendReaction(null);
      return;
    }
    if ((type == 0 && index == 1) || (this.camera_type == CAMERATYPE.SETTINGREACTION && type == 1)) {
      this.SelectUser(userid => {
        this.selected_user = userid;
        this.onSendReaction(userid, this.camera_type == CAMERATYPE.SETTINGREACTION, index == 0);
      })
      return;
    }
    if (this.camera_type == CAMERATYPE.CHATREACTION) {
      this.onSendReaction(this.params.userid, true, index == 0);
      return;
    }
    if (type == 0) {
      this.SelectUser(userid => {
        this.selected_user = userid;
        this.visibleDialog(true, 1);
      })
    } else {
      this.onSendReaction(this.selected_user, true, index == 0);
    }
  }
  editImage(url) {
    url = url.replace("file:///", "");
    const onDone = (uri) => {
      const path = pathParse(uri);
      this.onDoneEdit({ uri: `file://${uri}`, type: 0, ext: path.ext });
    };
    const onCancel = (code) => logger.log("cancel editor", code);
    if (Platform.OS == "android") {
      let confirm_message = null;
      if (this.camera_type == CAMERATYPE.EDITCAMERA) {
        confirm_message = translate(this.params?.confirm_message || "confirm-post");
      } else if (this.camera_type == CAMERATYPE.CHATREACTION && this.props.app.security) {
        confirm_message = translate("reaction-confirm-post");
      }
      PhotoEditSDK.Edit({
        path: url,
        visible_gallery: false,
        visible_camera: false,
        draw_watermark: true,
        watermark: Images.logo,
        confirm_message,
        onDone,
        onCancel
      });
    } else {
      let stickers = [];
      for (let i = 0; i < 119; i++) {
        stickers.push(`image_${i}`);
      }
      PhotoEditor.Edit({
        path: url,
        hiddenControls: ['save', 'share'],
        stickers,
        onDone: (uri) => {
          uri = uri.replace("file:///", "");
          this.props.navigation.navigate("ImageFilter", { uri, onDone });
        },
        onCancel
      });
    }
  }

  takeVideo = async () => {
    const { isRecording } = this.state;
    if (this.camera && !isRecording) {
      try {
        const recordOptions = {
          mute: false,
          maxDuration: 100,
          quality: RNCamera.Constants.VideoQuality["1080p"],
        };
        const promise = this.camera.recordAsync(recordOptions);
        if (promise) {
          this.setState({ isRecording: true });
          this.recordingInterval = setInterval(() => {
            let { recordingTime } = this.state;
            recordingTime += 1
            this.setState({ recordingTime });
          }, 1000);
          const data = await promise;
          const path = pathParse(data.uri);
          this.onDoneEdit({ ...data, type: 1, ext: path.ext });
        }
      } catch (e) {
        this.props.showToast((typeof e == "string" ? e : e.message) || "Can't access to your camera!")
        logger.error("camera record error", e);
      }
    }
  };

  stopVideo = async () => {
    await this.camera.stopRecording();
    clearInterval(this.recordingInterval);
    this.setState({ isRecording: false, recordingTime: 0 });
  };
  changeFlash = (type) => {
    this.setState({ flash: type });
    this.toggleFlashList();
  }
  openGallery = async () => {
    const option = {
      compressImageQuality: .99
    }
    const response = async (image) => {
      logger.log("selected image from gallery", image);
      if (image?.mime?.includes?.("image")) {
        const filename = `${RNFS.CachesDirectoryPath}/select_from_gallery_${Date.now()}.png`;
        await RNFS.moveFile(image.path, filename);
        this.editImage(filename);
        return;
      }
      const path = pathParse(image.path);
      this.onDoneEdit({ mine: image?.mime, type: 1, uri: image.path, ext: path.ext || `.${res.type?.split("/")[1]}` });
    }
    ImagePicker.openPicker(option)
      .then(response)
      .catch(err => logger.error("open picker", err));
  }
  onClose() {
    this.props.navigation.goBack();
  }
  getStringTime() {
    const { recordingTime } = this.state;
    let secs = parseInt(recordingTime % 60);
    let mins = parseInt(recordingTime / 60);
    if (secs <= 9) secs = `0${secs}`;
    if (mins <= 9) mins = `0${mins}`;
    return `${mins}:${secs}`;
  }
  setRatioState(item) {
    this.setState({
      ratio: {
        ...this.state.ratio,
        ...item
      }
    })
  }
  async onCameraReady() {
    const available = await this.camera.getSupportedRatiosAsync();
    this.setRatioState({ available })
  }
  onChangeRatio() {
    try {
      const { ratio } = this.state;
      let new_ratio = '';
      let full = false;
      if (ratio.full) {
        new_ratio = ratio?.available[0];
      } else {
        const index = ratio.available.indexOf(`${ratio.height}:${ratio.width}`);
        if (index + 2 == ratio.available.length) {
          full = true;
        } else {
          new_ratio = ratio.available[index + 1];
        }
      }
      let height = new_ratio.split(":")[0];
      let width = new_ratio.split(":")[1];
      this.setRatioState({ width, height, full, ratio_preview: true });
    } catch (err) { }
  }

  touchToFocus(event) {
    const { ratio } = this.state;
    let { pageX, pageY } = event.nativeEvent;
    const camera_height = ratio.full ? _HEIGHT : ratio.height * _WIDTH / ratio.width;
    pageY -= (_HEIGHT - camera_height) / 2;
    const isPortrait = camera_height > _WIDTH;
    let x = pageX / _WIDTH;
    let y = pageY / camera_height;
    if (isPortrait) {
      x = pageY / camera_height;
      y = -(pageX / _WIDTH) + 1;
    }
    this.setState({
      autoFocusPoint: {
        normalized: { x, y, autoExposure: true },
        drawRectPosition: { x: pageX, y: pageY },
      },
    });
  }
  render() {
    const { active_flash, inBackground, flash, isRecording, ratio, autoFocusPoint, dialog, visibleWhite } = this.state;
    const drawFocusRingPosition = {
      top: autoFocusPoint.drawRectPosition.y - 8,
      left: autoFocusPoint.drawRectPosition.x - 32,
    };
    return <View style={styles.container}>
      <KeepAwake />
      {!inBackground &&
        <>
          <RNCamera
            ref={ref => this.camera = ref}
            style={{
              width: _WIDTH,
              height: ratio.full ? _HEIGHT : ratio.height * _WIDTH / ratio.width,
            }}
            ratio={ratio.full ? `4:3` : `${ratio.height}:${ratio.width}`}
            type={this.state.type}
            flashMode={this.state.flash}
            focusable={true}
            autoFocusPointOfInterest={autoFocusPoint.normalized}
            onCameraReady={this.onCameraReady.bind(this)}
            autoFocus={'on'}>
            <View style={{ flex: 1 }}>
              <View style={[styles.autoFocusBox, drawFocusRingPosition]} />
              <TouchableWithoutFeedback onPress={this.touchToFocus.bind(this)}>
                <View style={{ flex: 1 }} />
              </TouchableWithoutFeedback>
            </View>
          </RNCamera>
          <View style={{ position: "absolute", top: 30, }}>
            <FadeInOut isVisible={ratio.ratio_preview} onDone={() => {
              this.fadetimer = setTimeout(() => {
                this.setRatioState({ ratio_preview: false });
                try {
                  clearTimeout(this);
                  clearTimeout(this.fadetimer);
                } catch (error) {
                }
              }, 2000);
            }}>
              <View style={{ backgroundColor: BaseColor.whiteColor, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8 }}>
                <Text title3 bold>{ratio.full ? `Full screen` : `${ratio.height}:${ratio.width}`}</Text>
              </View>
            </FadeInOut>
          </View>

          <View style={styles.top_tool_bar}>
            {isRecording ?
              <View style={[{ backgroundColor: BaseColor.blackOpacity2, paddingVertical: 5, paddingHorizontal: 20, borderRadius: 10, flexDirection: "row" }, styles.center]}>
                <View style={{ width: 12, height: 12, backgroundColor: BaseColor.redColor, borderRadius: 1000 }} />
                <Text whiteColor headline>  {this.getStringTime()}</Text>
              </View>
              :
              <>
                <Image noloading onPress={this.onClose.bind(this)} nopreview source={Images.ic_times} style={styles.ic_times} />
                <View style={{ flex: 1 }} />
                <View style={{ marginTop: 10 }}>
                  <ImageBackground source={Images.header_back} resizeMode={'stretch'} style={[styles.flash_back, styles.center, !active_flash && { opacity: .3 }]} />
                  {active_flash ?
                    <>
                      <Image noloading nopreview onPress={this.changeFlash.bind(this, "on")} source={Images.ic_flash.on} style={styles.ic_flash} />
                      <Image noloading nopreview onPress={this.changeFlash.bind(this, "auto")} source={Images.ic_flash.auto} style={styles.ic_flash} />
                      <Image noloading nopreview onPress={this.changeFlash.bind(this, "off")} source={Images.ic_flash.off} style={styles.ic_flash} />
                    </>
                    :
                    <Image noloading nopreview onPress={this.toggleFlashList.bind(this)} source={Images.ic_flash[flash]} style={styles.ic_flash} />
                  }
                </View>
              </>
            }
          </View>
          <View style={styles.bottom_tool_bar}>
            {!isRecording && <View style={styles.center}>
              <TouchableOpacity onPress={this.openGallery.bind(this)}>
                <ImageBackground source={Images.header_back} resizeMode={'stretch'} style={[styles.gallery_back, styles.center]}>
                  <Image noloading nopreview source={Images.ic_image_gallery} style={styles.gallery_icon} />
                </ImageBackground>
              </TouchableOpacity>
            </View>
            }
            <View style={{ flex: 1, height: 80 }}>
              <RecordingButton
                isRecording={isRecording}
                onPress={isRecording ? this.stopVideo.bind(this) : this.preTakePicture.bind(this)}
                onLongPress={!isRecording && this.takeVideo.bind(this)} />
            </View>
            {!isRecording && <View style={styles.center}>
              <TouchableOpacity onPress={this.toggleFacing.bind(this)}>
                <ImageBackground source={Images.header_back} resizeMode={'stretch'} style={[styles.switch_camera_back, styles.center]}>
                  <Image noloading nopreview source={Images.ic_switch_camera} style={styles.switch_camera} />
                </ImageBackground>
              </TouchableOpacity>
            </View>
            }
          </View>
        </>
      }
      <Overlay isVisible={dialog.visible} onBackdropPress={this.visibleDialog.bind(this, false)} overlayStyle={styles.overlay}>
        {dialog.type == 0 ?
          <>
            <TouchableOpacity style={[styles.action, { paddingTop: 30 }]} onPress={this.pressAction.bind(this, 0)}>
              <View style={styles.action_icon}>
                <Image noloading nopreview source={Images.reaction_text} style={{ width: 30, height: 30 }} />
              </View>
              <Text title2 primaryColor>{"Reaction"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.action]} onPress={this.pressAction.bind(this, 1)}>
              <View style={styles.action_icon}>
                <Image noloading nopreview source={Images.chat1} style={{ width: 30, height: 30 }} />
              </View>
              <Text title2 primaryColor>{"Standard"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.action, { paddingBottom: 25 }]} onPress={this.pressAction.bind(this, 2)}>
              <View style={styles.action_icon}>
                <Image noloading nopreview source={Images.ic_gallery} style={{ width: 30, height: 30 }} />
              </View>
              <Text title2 primaryColor>{"Story"}</Text>
            </TouchableOpacity>
          </>
          :
          <>
            <TouchableOpacity style={[styles.action, styles.security, { paddingTop: 30 }]} onPress={this.pressAction.bind(this, 0)}>
              <View style={styles.action_icon}>
                <Image source={Images.ic_security} style={{ width: 30, height: 30 }} />
              </View>
              <Text title2 primaryColor>{"Send hidden"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.action, styles.normal, { paddingBottom: 25 }]} onPress={this.pressAction.bind(this, 1)}>
              <View style={styles.action_icon}>
                <Image noloading nopreview source={Images.chat1} style={{ width: 30, height: 30 }} />
              </View>
              <Text title2 primaryColor>{"Send normal"}</Text>
            </TouchableOpacity>
          </>
        }
        <View style={{ position: "absolute", top: -15, right: -15, backgroundColor: BaseColor.blackColor, borderRadius: 999, padding: 2 }}>
          <TouchableOpacity onPress={this.visibleDialog.bind(this, false)}>
            <Icon name={'closecircle'} color={BaseColor.whiteColor} size={35} type={"AntDesign"} />
          </TouchableOpacity>
        </View>
      </Overlay>
      {visibleWhite &&
        <View style={{ width: "100%", height: "100%", position: "absolute", backgroundColor: BaseColor.whiteColor, justifyContent: "center", alignItems: "center" }} >
          <Icon name={'lightbulb-on-outline'} type={'MaterialCommunityIcons'} color={BaseColor.yellowColor} size={100} />
        </View>
      }
    </View>
  }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(CustomCamera);
