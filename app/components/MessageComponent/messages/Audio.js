import { Icon, Text } from "@components";
import { BaseColor } from "@config";
import Slider from '@react-native-community/slider';
import { getDeviceWidth } from "@utils";
import React, { Component } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import Sound from 'react-native-sound';
let MAXWIDTH = getDeviceWidth() * .5;

const SOUND_STATE = {
    INIT: 0,
    PLAYING: 1,
    PAUSE: 2,
    ERROR: 3,
}
export default class Audio extends Component {
    state = {
        cur_state: SOUND_STATE.DEFAULT,
        loading: false,
        cur_position: 0,
    }
    constructor(props) {
        super(props);
    }
    getTimeFromSec(sec) {
        let time = '00:00';
        if (!sec) return time;
        sec = parseInt(sec);
        if (sec < 10) time = `00:0${sec}`;
        else if (sec < 60) time = `00:${sec}`;
        else time = `${parseInt(sec / 60)}:${parseInt(sec % 60)}`;
        return time;
    }
    componentDidMount() {
        const { url } = this.props;
        if (!url) return
        Sound.setCategory('Playback');
        this.soundInstance = new Sound(url, Platform.OS == "android" ? Sound.MAIN_BUNDLE : null, (error) => {
            if (error) {
                this.setState({ cur_state: SOUND_STATE.ERROR });
                return;
            }
            this.setState({ cur_state: SOUND_STATE.INIT });
        });
        this.interval = setInterval(() => {
            const playing = this.soundInstance?.isPlaying();
            if (playing) {
                this.soundInstance.getCurrentTime((cur_position, isplaying) => this.setState({ cur_position }));
            }
        }, 100);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
        try { this.soundInstance.stop(); } catch (error) { }
        try { this.soundInstance.release(); } catch (error) { }
    }
    get playIcon() {
        const { cur_state } = this.state;
        switch (cur_state) {
            case SOUND_STATE.INIT:
            case SOUND_STATE.PAUSE:
                return "play";
            case SOUND_STATE.PLAYING:
                return "pause";
            case SOUND_STATE.ERROR:
                return "times";
            default:
                return "play";
        }
    }
    soundPlay(cur_state) {
        if (!this.soundInstance) return;
        switch (cur_state) {
            case SOUND_STATE.INIT:
            case SOUND_STATE.PAUSE:
                this.setState({
                    cur_state: SOUND_STATE.PLAYING
                }, () => {
                    this.props.onAudioPlay();
                    this.soundInstance.stop(() => {
                        this.soundInstance.play((success) => {
                            this.props.onVisiteMessage();
                            this.setState({ cur_state: SOUND_STATE.INIT })
                        });
                    });
                })
                return;
            case SOUND_STATE.PLAYING:
                this.setState({ cur_state: SOUND_STATE.PAUSE }, () => this.soundInstance.pause())
                return;
            case SOUND_STATE.ERROR:
                this.setState({ cur_state: SOUND_STATE.INIT }, () => {
                    this.soundInstance.stop();
                    this.soundInstance.release();
                })
                return;
        }
    }
    UNSAFE_componentWillReceiveProps(newProps) {
        const { isPlaying, onVisiteMessage } = newProps;
        if (!isPlaying && this.soundInstance && this.soundInstance.isPlaying()) {
            this.soundPlay(SOUND_STATE.PLAYING);
            onVisiteMessage();
        }
    }
    changeSeek(e) {
        this.soundInstance.setCurrentTime(e);
    }
    render() {
        const { isPlaying, isVisited } = this.props;
        const { cur_state, cur_position } = this.state;
        let duration = this.soundInstance?.getDuration();
        if (!(duration > 0)) duration = 100;

        return (
            <View style={{ height: 40, width: MAXWIDTH, marginHorizontal: 10, flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity style={{ padding: 5 }} disabled={isVisited} onPress={this.soundPlay.bind(this, cur_state)}>
                    <Icon name={this.playIcon} color={isVisited ? BaseColor.grayColor : BaseColor.primaryColor} size={18} />
                </TouchableOpacity>
                <Slider
                    ref={ref => this.slider = ref}
                    style={{ flex: 1 }}
                    disabled={true}
                    value={cur_position}
                    minimumValue={0}
                    maximumValue={duration}
                    step={.1}
                    disabled={isVisited || !isPlaying}
                    minimumTrackTintColor={BaseColor.primaryColor}
                    maximumTrackTintColor={BaseColor.grayColor}
                    thumbTintColor={isVisited ? BaseColor.grayColor : BaseColor.primaryColor}
                    tapToSeek
                    onValueChange={this.changeSeek.bind(this)}
                />
                <Text caption1>{this.getTimeFromSec(cur_position)}</Text>
            </View>
        )
    }
}