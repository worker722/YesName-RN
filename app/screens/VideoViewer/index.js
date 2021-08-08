import { BubbleImage, Image, VideoPlayer } from "@components";
import { BaseColor, Images } from "@config";
import { image_uri } from "@utils";
import React, { Component } from "react";
import { SafeAreaView, TouchableOpacity, View } from "react-native";
import KeepAwake from 'react-native-keep-awake';
import { logger } from "@actions";
import { connect } from "react-redux";
import * as reduxActions from "@actions";
import pathParse from 'path-parse';
import RNFS from "react-native-fs";
import CameraRoll from "@react-native-community/cameraroll";

class VideoViewer extends Component {
  constructor(props) {
    super(props);
    const { route: { params } } = this.props;
    this.params = params;
    this.rotateEvent = null;
  }
  componentDidMount() {
    this.props.showLoading(true);
  }
  onDone() {
    this.props.showLoading(false);
    this.params?.onDone?.();
    this.props?.navigation?.goBack();
  }
  onClose() {
    this.props.showLoading(false);
    this.params?.onClose?.();
    this.props?.navigation?.goBack()
  }
  onLoad = () => {
    this.props.showLoading(false);
  }
  onError = (err) => {
    logger.error("video player error", err);
    this.props.showLoading(false);
    this.onClose();
  }
  async onDownload() {
    this.props.showLoading(true, "Downloading...");
    const path = pathParse(this.params.url);
    let filename = path.base;
    if (path.base.split(".").length < 2) {
      filename = `${(new Date()).getTime()}.${Platform.OS == "android" ? "mp4" : "mov"}`;
    }
    const downloadPath = `${Platform.OS == "android" ? RNFS.DownloadDirectoryPath : RNFS.DocumentDirectoryPath}/${Math.floor(Math.random()*100)}${filename}`;
    try {
      await RNFS.copyFile(this.params.url, downloadPath);
        CameraRoll.save(downloadPath, { album: "MoRe" })
          .catch(err => logger.log("camera role err", err));
    } catch (error) {
      logger.error("video download error", error);
      this.props.showToast("Download canceled due to error");
    }
    this.props.showLoading(false);
  }
  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BaseColor.blackColor }}>
        <KeepAwake />
        <VideoPlayer
          onLoad={this.onLoad}
          onError={this.onError}
          source={image_uri(this.params.url)}
          style={{ width: "100%", height: "100%" }}
          autoplay={true}
          resizeMode={'contain'}
          onEnd={() => {
            if (this.params.security) this.onClose();
          }}
          showControl
          showSeekbar
        />
        <View style={{ position: "absolute", top: 30, right: 10 }}>
          <TouchableOpacity onPress={this.onClose.bind(this)} style={{ marginHorizontal: 10 }} >
            <Image source={Images.ic_times} style={{ width: 28, height: 28 }} noloading nopreview />
          </TouchableOpacity>
        </View>
        {this.params.onDone &&
          <>
            <View style={{ position: "absolute", bottom: 80, right: 20, left: 20, flexDirection: "row" }}>
              <BubbleImage onPress={this.onDownload.bind(this)} source={Images.download} width={30} height={30} active={"default"} />
              <View style={{ flex: 1 }} />
              <BubbleImage onPress={this.onDone.bind(this)} source={Images.send} width={30} height={30} active={"default"} />
            </View>
          </>
        }
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(VideoViewer);