import * as reduxActions from "@actions";
import { ProgressBar, VideoPlayer } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import { getDeviceHeight, getDeviceWidth, image_uri, videoThumbnail } from "@utils";
import pathParse from 'path-parse';
import React, { Component } from 'react';
import { Image, TouchableOpacity, View } from "react-native";
import { RNCamera } from 'react-native-camera';
import Draggable from 'react-native-draggable';
import { connect } from "react-redux";
import styles from "./styles.js";
const { ApiActions, logger } = reduxActions;

const camSize = 45;
const ScreenWidth = getDeviceWidth(true);
const ScreenHeight = getDeviceHeight(true);
const initPositionX = ScreenWidth - 40 - camSize * 3;
const initPositionY = ScreenHeight - 40 - camSize * 4;
class Reaction extends Component {
    state = {
        duration: 10,
        loadMedia: false,
        readyCamera: false,
        recording: false,
    }
    constructor(props) {
        super(props);
        const { route: { params } } = this.props;
        this.data = params;
        this.dragPosition = {
            x: ScreenWidth - 40 - camSize * 3,
            y: ScreenHeight - 40 - camSize * 4,
            width: camSize * 3,
            height: camSize * 4,
            original_width: ScreenWidth,
            original_height: ScreenHeight
        }
    }
    componentDidMount() {
        this.errornum = 0;
        this.props.showLoading(true);
        this.blurListener = this.props.navigation.addListener("blur", () => {
            this.props.showLoading(false);
            logger.log("blur page");
            if (this.state.recording) {
                this.camera?.stopRecording();
            }
        });
    }
    componentWillUnmount() {
        try {
            this.blurListener.remove();
        } catch (error) {
        }
    }

    onLoaded(item) {
        if (item.error) {
            logger.error("load video error", item.error);
            this.backMessage("Can't play this video!");
            return;
        }
        logger.log("ready media");
        let duration = 10;
        if (this.data.type == 0) {//image
            duration = 8;
        } else if (this.data.type == 1) {//video
            duration = item.duration + 3;
        } else if (this.data.type == 2) {//gif image
            duration = 8;
        }
        this.setState({
            duration
        }, () => {
            setTimeout(() => {
                this.recordCamera();
            }, 1000);
        })
    }
    pauseCamera(pause) {
        logger.log("pause camera", pause);
        try {
            if (pause) {
                this.camera?.pausePreview();
            } else {
                this.camera?.resumePreview();
            }
        } catch (error) {
            logger.error("pause camera error", error);
        }
    }
    onCameraReady() {
        this.pauseCamera(true);
    }
    recordCamera() {
        this.errornum += 1;
        logger.log("Start record", this.errornum, "recording => ", this.state.recording);
        if (this.state.recording) return;
        try {
            this.props.showLoading(false);
            this.setState({ recording: true }, async () => {
                logger.log("start record");
                await this.startRecord();
            });
        } catch (error) {
            if (this.errornum < 4) {
                setTimeout(() => {
                    this.recordCamera();
                }, 500);
                return;
            }
            logger.error("send reaction error", error);
            this.backMessage("Can't record video from your camera...");
            return;
        }
    }
    async startRecord() {
        this.pauseCamera(false);
        logger.error("record started");
        const video = await this.camera.recordAsync({
            mute: false,
            maxDuration: 100,
            quality: RNCamera.Constants.VideoQuality['4:3'],
        });
        logger.error("end recording, saving");
        this.errornum = 20;
        this.pauseCamera(true);
        this.setState({ recording: false });
        this.props.showLoading(true, "Sending...");
        const path = pathParse(video.uri);

        const filename = new Date().getTime();
        const choose_image = {
            type: video.mine || `video/${path.ext.slice(1, path.ext.length)}`,
            name: `${filename}${path.ext}`,
            uri: video.uri
        };
        const res = await this.props.uploadFile2Server(choose_image, BaseConfig.UPLOADTYPE.CHAT);

        let thumbnail = await videoThumbnail(res.path);
        const thumbfile = {
            name: `${filename}_thumb.png`,
            uri: thumbnail.path,
            type: 'image/png'
        };
        const thumb_res = await this.props.uploadFile2Server(thumbfile, BaseConfig.UPLOADTYPE.CHAT);
        thumbnail.path = thumb_res.path;

        let attach = JSON.stringify({ url: res.path, name: res.name, type: 1, thumbnail });
        let message = {
            sender: ApiActions._CURRENTUSERID(),
            receiver: this.data.userid,
            roomid: this.data.roomid,
            content: '',
            type: BaseConfig.CONTENTTYPE.REPLY_REACTION,
            attach,
            quoteid: this.data.id,
            dragPosition: this.dragPosition
        };
        this.props.sendMessage(message);
        this.backMessage();
    }
    async onTimeout() {
        try {
            this.camera.stopRecording();
        } catch (error) {
            logger.error("stop camera err", error);
            this.backMessage("Can't record video from your camera");
        }
    }
    backMessage(msg) {
        if (msg) {
            this.props.showToast(msg);
        }
        this.props.showLoading(false);
        logger.log("----------back------------", msg)
        this.props.navigation.goBack();
    }
    onDragRelease(p1, p2, { top, left }) {
        this.dragPosition.x = left;
        this.dragPosition.y = top;
    }
    render() {
        const { duration, recording } = this.state;
        const { url, name, type, id } = this.data;
        return (
            <View style={styles.container}>
                {type === 0 ?
                    <Image
                        source={image_uri(url)}
                        onLoadEnd={this.onLoaded.bind(this)}
                        resizeMode={"contain"}
                        style={{ width: ScreenWidth, height: ScreenHeight }}
                    />
                    : <VideoPlayer
                        source={image_uri(url)}
                        onLoad={this.onLoaded.bind(this)}
                        onError={this.onLoaded.bind(this)}
                        style={{ width: ScreenWidth, height: ScreenHeight }}
                        paused={!recording}
                        resizeMode={'contain'}
                    />
                }
                <Draggable x={initPositionX} y={initPositionY} touchableOpacityProps={{ activeOpactiy: 1 }} onDragRelease={this.onDragRelease.bind(this)}>
                    <>
                        <RNCamera
                            ref={ref => this.camera = ref}
                            style={{ width: 3 * camSize, height: 4 * camSize, borderColor: BaseColor.quoteColor, borderWidth: 4 }}
                            onCameraReady={this.onCameraReady.bind(this)}
                            type={"front"}
                            onMountError={(err) => this.backMessage("Can't access to your camera!")}
                        />
                        <View style={styles.draggableView} />
                    </>
                </Draggable>
                <ProgressBar duration={duration} isLoaded={recording} onFinish={this.onTimeout.bind(this)} />
                <View style={{ position: "absolute", top: 45, right: 10, zIndex: 999 }}>
                    <TouchableOpacity onPress={this.onTimeout.bind(this)}>
                        <Image source={Images.ic_times} style={styles.ic_times} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(Reaction);
