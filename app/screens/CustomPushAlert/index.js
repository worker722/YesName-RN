import * as reduxActions from "@actions";
import { Avatar, Icon, Text } from "@components";
import { BaseColor } from "@config";
import React, { Component } from 'react';
import { Image, TouchableOpacity, View } from "react-native";
import * as Animatable from 'react-native-animatable';
import Sound from 'react-native-sound';
import { connect } from "react-redux";
import { styles } from "./style";
const { logger } = reduxActions;
import RingerMode from 'rn-ringer-mode';
import GestureRecognizer from 'react-native-swipe-gestures';

const ringtone = require("@assets/resources/alarm.mp3");

class CustomPushAlert extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        Sound.setCategory('Playback');
        this.alarmRingtone = new Sound(ringtone, (error) => {
            if (error) {
                logger.error("alarm ring error", error);
                this.alarmRingtone = null;
                return;
            }
        });
    }
    hideAlert = () => {
        clearTimeout(this._interval);
        this._interval = null;
        this.props.hideNotification();
    }

    onPressAlert = () => {
        try {
            const { roomid, security } = this.props.status.notification.data;
            const { app: { security: appSecurity } } = this.props;
            if ((security == "1") != appSecurity) {
                this.props.changeSecurity(security == "1");
            }
            global.roomid = roomid;
            this.props.goNextPage({ page: "Chat", params: { roomid } });
        } catch (error) {
            logger.error("press alert", error);
        }
        this.hideAlert();
    }
    onSwipe() {
        this.hideAlert();
    }
    render = () => {
        const { status: { notification } } = this.props;
        if (notification?.data?.chat == "chat") { }
        else return <></>
        const { notification: { title, body, image }, data, messageId } = notification;
        if (messageId != global.befmessageid) {
            this.hideAlert();
            global.befmessageid = messageId;

            RingerMode.getRingerMode()
                .then(mode => {
                    if (mode == "NORMAL") this.alarmRingtone?.play();
                });
        }

        const user = JSON.parse(data.user || "{}") || {};

        clearTimeout(this._interval);
        this._interval = null;
        this._interval = setTimeout(this.hideAlert, 5000);

        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80,
        };
        return (
            <Animatable.View animation={"slideInDown"} iterationCount={1} duration={1000} direction="normal" style={styles.container}>
                <GestureRecognizer
                    onSwipe={this.onSwipe.bind(this)}
                    config={config}
                >
                    <TouchableOpacity activeOpacity={0.8} onPress={this.onPressAlert} style={styles.main_contrainer}>
                        <View style={{ flex: 1 }}>
                            {!!title && <Text subhead>  {title}</Text>}
                            {!!body && <Text headline numberOfLines={1} style={{ marginTop: 5 }}>{body}</Text>}
                        </View>
                        <View style={{ marginHorizontal: 10 }}>
                            {image ?
                                <Image source={{ uri: image }} style={{ width: 40, height: 40, borderRadius: 9999 }} />
                                :
                                <Avatar size={'medium'} user={user} />
                            }
                        </View>
                    </TouchableOpacity>
                    <View style={styles.times}>
                        <TouchableOpacity onPress={this.hideAlert.bind(this)}>
                            <Icon name={'times'} size={16} color={BaseColor.blackColor} />
                        </TouchableOpacity>
                    </View>
                </GestureRecognizer>
            </Animatable.View>
        )
    }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(CustomPushAlert);
