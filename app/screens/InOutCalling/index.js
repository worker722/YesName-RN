import * as reduxActions from "@actions";
import { Avatar, Icon, Text, TimerView } from "@components";
import { BaseColor, BaseConfig } from '@config';
import React, { Component } from "react";
import { BackHandler, Platform, TouchableOpacity, View } from "react-native";
import InCallManager from 'react-native-incall-manager';
import { mediaDevices, RTCView } from 'react-native-webrtc';
import { connect } from "react-redux";
import Draggable from 'react-native-draggable';
import { getDeviceWidth, getDeviceHeight } from "@utils";
import styles from './styles';
import KeepAwake from 'react-native-keep-awake';
const { logger } = reduxActions;
const { CALLINGSTATE } = BaseConfig;

const ScreenWidth = getDeviceWidth(true);
const initPositionX = ScreenWidth - 120;
const initPositionY = 30;
const maxY = getDeviceHeight(true) * .8 - 30;


class InOutCalling extends Component {
    constructor(props) {
        super(props);
        const { route: { params: { data, answer, forceEnd } } } = this.props;//data: callerid, state, type
        this.forceEnd = forceEnd;
        logger.log(this.props.route.params);
        // if userid exist in data -> outgoing screen
        // if callerid exist in data -> incoming screen
        this.data = data;
        this.OUTGOING = (parseInt(data.userid) > 0);
        this.INCOMING = (parseInt(data.callerid) > 0);

        const VIDEO_CALL = data.type == BaseConfig.CALL.VIDEO;
        const VOICE_CALL = data.type == BaseConfig.CALL.VOICE;

        this.state = {
            options: {
                mute: false,
                speaker: false,
                calling: answer,
                front: true
            },
            myStream: null,
            VIDEO_CALL,
            VOICE_CALL
        }

        const media = VOICE_CALL ? "audio" : "video";
        if (this.OUTGOING) {
            InCallManager.start({ media, ringback: "_DTMF_" });
        }
        try {

            if (Platform.OS == "android") {
                InCallManager.turnScreenOn();
            }
            InCallManager.setKeepScreenOn(true);
        } catch (error) {
            logger.log(error);
        }

        this.props.navigation.addListener("blur", () => {
            global.callscreen = false;
            if (this.forceEnd) {
                BackHandler.exitApp();
            }
            this.stopRing();
            clearTimeout(this.timer);
            // clearInterval(this.check_timer);
            // this.check_timer = null;
            this.timer = null;
            this.props.setRemoteStream(null);
            InCallManager.stop();
            if (global.eventblur) return;

            if (this.answer || this.INCOMING) {
                this.endCall(null);
            } else {
                this.missedCall();
            }
        });
        this.props.navigation.addListener("focus", () => {
            setTimeout(() => {
                global.callscreen = true;
            }, 500);
        });
        this.SpeakerMute = this.SpeakerMute.bind(this);
        this.MicMute = this.MicMute.bind(this);
        this.endCall = this.endCall.bind(this);
        this.declineCall = this.declineCall.bind(this);
        this.answerCall = this.answerCall.bind(this);
        this.switchCallingState = this.switchCallingState.bind(this);

        this.answer = answer;

        if (answer) {
            this.answerDirectCall();
        } else {
            if (this.INCOMING) {
                InCallManager.startRingtone();
                // }else{
                // InCallManager.startRingback();
            }
        }
    }
    answerDirectCall() {
        if (global.mypeerid) {
            this.props.sendCalling({ ...this.data, state: CALLINGSTATE.ACCEPT, peerid: global.mypeerid });
        } else {
            setTimeout(() => {
                this.answerDirectCall();
            }, 1000);
        }
    }
    stopRing() {
        try {
            if (this.INCOMING) {
                InCallManager.stopRingtone();
                InCallManager.stopRingback();
            } else {
                InCallManager.stopRingback();
                InCallManager.stopRingtone();
            }
        } catch (error) {
        }
    }
    setSpeaker(speaker) {
        this.setOptions({ speaker });
        InCallManager.setSpeakerphoneOn(speaker);
        InCallManager.setForceSpeakerphoneOn(speaker);
    }
    componentDidUpdate() {
        const { call: { force_close } } = this.props;
        if (force_close) {
            this.props.forceClose();
            this.toastBack('User ended the call (force)');
        }
    }
    switchCallingState() {
        if (this.state.VIDEO_CALL) {
            this.emitSwitchState(BaseConfig.CHAGNECALLSTATE.ACCEPT);
            this.acceptChangeState(BaseConfig.CALL.VOICE);
            return;
        }
        this.emitSwitchState(BaseConfig.CHAGNECALLSTATE.REQUEST);
        this.props.showAlert({
            title: "Switch call",
            message: "Waiting to accept switch call",
            isConfirm: false,
            visible: true,
            onClose: () => {
                this.emitSwitchState(BaseConfig.CHAGNECALLSTATE.END);
            }
        });
    }
    emitSwitchState(state) {
        const type = this.state.VIDEO_CALL ? BaseConfig.CALL.VOICE : BaseConfig.CALL.VIDEO;
        const callerid = this.INCOMING ? this.data.callerid : this.data.userid;
        let data = { callerid, type, state };
        this.props.emitChangeCallingState(data);
    }
    componentDidMount() {
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            return true;
        });
        this.props.listenCalling(this.listenCalling.bind(this));
        this.props.listenRoomState(res => {
            if (res.empty) this.endCall();
        });
        this.props.listenCallingState(this.chagneState.bind(this));
        if (this.OUTGOING) this.props.callUser(this.data.userid, this.data.type);

        this.setSpeaker(this.state.VIDEO_CALL);

        this.timer = setTimeout(() => {
            if (this.answer) return;
            this.props.navigation.goBack();
        }, BaseConfig.MISSED_CALL_TIME);
        // this.check_timer = setInterval(() => {
        //     if (this.answer) {
        //         this.props.emitRoomState(this.data.roomid);
        //     }
        // }, 5000);
        this.initWebRTC();
    }

    chagneState({ type, state }) {
        if (state == BaseConfig.CHAGNECALLSTATE.REQUEST) {
            this.props.showAlert({
                title: "Switch call",
                message: "Waiting to accept switch call",
                textConfirm: "Accept",
                visible: true,
                onConfirm: () => {
                    this.emitSwitchState(BaseConfig.CHAGNECALLSTATE.ACCEPT);
                    this.acceptChangeState(type);
                },
                onClose: () => {
                    this.emitSwitchState(BaseConfig.CHAGNECALLSTATE.DECLINE);
                }
            })
        } else if (state == BaseConfig.CHAGNECALLSTATE.END || state == BaseConfig.CHAGNECALLSTATE.DECLINE) {
            this.props.destroyView();
            this.props.showToast("User cancel the request");
        } else if (state == BaseConfig.CHAGNECALLSTATE.ACCEPT) {
            this.props.destroyView();
            this.acceptChangeState(type);
        }
    }
    acceptChangeState(type) {
        this.data.type = type;
        const VIDEO_CALL = type == BaseConfig.CALL.VIDEO;
        const VOICE_CALL = type == BaseConfig.CALL.VOICE;
        this.setSpeaker(VIDEO_CALL);
        this.setState({
            VIDEO_CALL,
            VOICE_CALL,
        });
    }
    initWebRTC() {
        const { options: { front } } = this.state;
        mediaDevices.enumerateDevices().then(sourceInfos => {
            let videoSourceId;
            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if (sourceInfo.kind == "videoinput" && sourceInfo.facing == (front ? "front" : "environment")) {
                    videoSourceId = sourceInfo.deviceId;
                }
            }
            const CONFIG = {
                width: 640,
                height: 480,
                frameRate: 30,
                facingMode: (front ? "user" : "environment"),
                deviceId: videoSourceId
            };
            mediaDevices.getUserMedia({
                audio: true,
                video: CONFIG,
            })
                .then(myStream => {
                    this.setState({ myStream }, () => {
                        this.callPeer();
                    });
                })
                .catch(error => { logger.error("media err", error); });
        });
    }
    callPeer(peerid) {
        const { myStream } = this.state;
        if (peerid) {
            this.props.connectToNewUser(peerid, myStream);
        } else {
            this.props.receiveCall(myStream);
        }
    }
    missedCall() {
        logger.log("miss call------------", this.data);
        this.props.sendCalling({ ...this.data, callerid: this.data.userid, state: CALLINGSTATE.MISSED });
        this.toastBack('No answer, please call again later', true);
    }
    toastBack = (msg, noback, delay = 500) => {
        this.props.showToast(msg);
        if (noback) return;
        setTimeout(() => {
            global.eventblur = true;
            this.props.navigation.goBack();
            setTimeout(() => (global.eventblur = false), 500);
        }, delay);
    }
    listenCalling = (res) => {
        const { state, roomid } = res;
        if (roomid) {
            this.data.roomid = roomid;
        }
        logger.log("listen", this.data, roomid, state);
        this.answer = true;
        switch (state) {
            case CALLINGSTATE.MISSED:
                this.toastBack('You not received the call');
                break;
            case CALLINGSTATE.BUSY:
                this.toastBack('User busy now');
                break;
            case CALLINGSTATE.ACCEPT:
                this.callPeer(res.peerid);
                this.stopRing();
                this.setOptions({ calling: true });
                this.props.showToast("User answer the call");
                break;
            case CALLINGSTATE.DECLINE:
                this.toastBack('User decline the call');
                break;
            case CALLINGSTATE.END:
                this.endStream();
                this.toastBack('end call');
                break;
        }
    }
    componentWillUnmount() {
        this.props.offlistenCalling();
        BackHandler.removeEventListener("hardwareBackPress");
        this.backHandler?.remove();
        this.backHandler = null;
    }
    endStream() {
        try {
            this.state.myStream?.release()
        } catch (error) {
            logger.error("release stream: ", error);
        }
    }
    endCall(back = true) {
        const callerid = this.INCOMING ? this.data.callerid : this.data.userid;
        this.props.sendCalling({ ...this.data, callerid, state: CALLINGSTATE.END });
        this.endStream();
        this.toastBack("You end the call", !back);
    }
    declineCall() {
        this.props.sendCalling({ ...this.data, state: CALLINGSTATE.DECLINE });
        this.toastBack("You decline the call");
    }
    answerCall() {
        this.answer = true;
        this.stopRing();
        this.setOptions({ calling: true });
        this.props.sendCalling({ ...this.data, state: CALLINGSTATE.ACCEPT, peerid: global.mypeerid });
        this.props.showToast("You answer the call");
    }
    renderIcon({
        icon,
        text,
        iSize = 24,
        iColor = BaseColor.whiteColor,
        bColor = BaseColor.transparent,
        onPress = () => { },
        type,
    }) {
        return (
            <View style={[{ flex: 1 }, styles.HCenter, styles.VCenter]}>
                <TouchableOpacity onPress={onPress}
                    style={[
                        {
                            backgroundColor: bColor, borderRadius: 1000, marginBottom: 8
                        },
                        iSize == 24 ? { width: 55, height: 55 } : { width: 65, height: 65 },
                        styles.HCenter,
                        styles.VCenter
                    ]}>
                    <Icon name={icon} size={iSize} color={iColor} type={type} />
                </TouchableOpacity>
                {text && <Text whiteColor>{text}</Text>}
            </View>
        )
    }
    SpeakerMute() {
        const { options } = this.state;
        this.setSpeaker(!options.speaker);
    }
    MicMute() {
        const { options, myStream } = this.state;
        let mute = !options.mute;
        this.setOptions({ mute });
        myStream.getTracks().forEach((t) => {
            if (t.kind == 'audio') {
                t.enabled = !t.enabled
                t.mute = mute;
            }
        });
    }
    setOptions(item) {
        this.setState({
            options: {
                ...this.state.options,
                ...item
            }
        })
    }
    getCallingUser() {
        const { users } = this.props.users;
        const userid = this.data[this.OUTGOING ? 'userid' : 'callerid'];
        const user = users.find(item => item.id == userid);
        return user || {};
    }
    switchCamera() {
        const { myStream, options: { front } } = this.state;
        this.setOptions({ front: !front });
        myStream.getVideoTracks().forEach((track) => {
            track._switchCamera()
        })
    }
    render() {
        const { myStream, options, VIDEO_CALL, VOICE_CALL } = this.state;
        const { call: { caller_stream } } = this.props;
        const user = this.getCallingUser();
        logger.log("caller stream", caller_stream?.toURL?.());
        return (
            <View style={[styles.HCenter, styles.basecontainer]}>
                <KeepAwake />
                {options.calling &&
                    <>
                        <RTCView objectFit='cover' streamURL={caller_stream?.toURL?.()} style={[styles.remoteStream, VOICE_CALL && styles.hide]} />
                        <Draggable x={initPositionX} y={initPositionY} z={2} maxY={maxY} touchableOpacityProps={{ activeOpactiy: 1 }}>
                            <RTCView objectFit='cover' streamURL={myStream?.toURL?.()} style={[styles.mystream, VOICE_CALL && styles.hide]} />
                            <View style={[styles.draggableView, VOICE_CALL && styles.hide]}>
                            </View>
                        </Draggable>
                    </>
                }
                <View style={options.calling && VIDEO_CALL && styles.hide}>
                    <View style={[styles.containers, styles.VCenter, styles.HCenter]}>
                        <View style={styles.avatar} />
                        <Avatar user={user} size={"xlarge"} />
                        <Text title1 whiteColor style={styles.username}>{`${user.name || ''}`}</Text>
                        <Text title1 whiteColor style={styles.username}>{`${user.phone || ''}`}</Text>
                        {options.calling ?
                            <TimerView isPlay title2 whiteColor bold />
                            :
                            <Text title2 whiteColor>{this.INCOMING ? "Incoming call" : "Calling"}</Text>
                        }
                    </View>
                    <View style={[styles.containers]}>
                    </View>
                </View>
                <View style={styles.toolbar}>
                    <View style={styles.flexRow}>
                        {options.calling &&
                            <>
                                {
                                    this.renderIcon({
                                        icon: VIDEO_CALL ? 'microphone-alt' : 'video',
                                        text: VIDEO_CALL ? 'Voice' : 'Video',
                                        onPress: this.switchCallingState
                                    })
                                }
                                {
                                    this.renderIcon({
                                        icon: options.mute ? 'microphone-alt' : 'microphone-alt-slash',
                                        text: 'Mute',
                                        ...(VIDEO_CALL && { bColor: BaseColor.blackOpacityColor, }),
                                        ...(VIDEO_CALL && options.mute && { iColor: BaseColor.primaryColor, bColor: BaseColor.whiteColor }),
                                        onPress: this.MicMute
                                    })
                                }
                            </>
                        }

                        {this.renderIcon({
                            icon: 'phone-hangup',
                            iSize: 38,
                            type: "MaterialCommunityIcons",
                            bColor: BaseColor.redColor,
                            onPress: (this.OUTGOING || options.calling) ? this.endCall : this.declineCall
                        })}
                        {(!options.calling && this.INCOMING) && this.renderIcon({
                            icon: VIDEO_CALL ? 'video' : "phone",
                            iSize: 28,
                            bColor: BaseColor.darkPrimary2Color,
                            onPress: this.answerCall
                        })}
                        {options.calling &&
                            <>
                                {
                                    this.renderIcon({
                                        icon: 'volume-up',
                                        text: 'Speaker',
                                        ...(VIDEO_CALL && {
                                            bColor: BaseColor.blackOpacityColor,
                                        }),
                                        ...(options.speaker && {
                                            iColor: BaseColor.primaryColor,
                                            bColor: BaseColor.whiteColor
                                        }),
                                        onPress: this.SpeakerMute
                                    })
                                }
                                {VIDEO_CALL &&
                                    this.renderIcon({
                                        icon: options.front ? 'camera-rear' : 'camera-front',
                                        type: 'MaterialIcons',
                                        text: options.front ? 'Back' : 'Front',
                                        iColor: BaseColor.whiteColor,
                                        onPress: this.switchCamera.bind(this)
                                    })
                                }
                            </>
                        }
                    </View>
                </View>
            </View>
        )
    }
}
const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(InOutCalling);