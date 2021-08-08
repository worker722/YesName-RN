import { Image, RecordingButton, TimerView } from "@components";
import { BaseColor, Images } from "@config";
import React, { Component } from "react";
import { View } from "react-native";
import AudioRecord from 'react-native-audio-record';
import { Overlay } from 'react-native-elements';
// https://github.com/shobulive/react-native-wave-view
import Wave from "react-native-waveview";
import styles from "./styles";
export default class Index extends Component {
    state = {
        isRecording: false,
        recordTime: "00:00",
        recorded: false,
        visible: false
    }
    constructor(props) {
        super(props);
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.visible == this.state.visible) {
            return;
        }
        if (nextProps.visible) {
            // this.onStartRecord();
        } else {
            this.onClose();
        }
        this.setState({ visible: nextProps.visible });
    }
    onStartRecord = async () => {
        try {
            this.filename = `${(new Date).getTime()}.wav`;
            const options = {
                sampleRate: 16000,  // default 44100
                channels: 1,        // 1 or 2, default 1
                bitsPerSample: 16,  // 8 or 16, default 16
                audioSource: 1,     // android only (see below)
                wavFile: this.filename // default 'audio.wav'
            };

            AudioRecord.init(options);
            AudioRecord.start();

            this.setState({ isRecording: true, });
        } catch (error) {
            this.setState({ recorded: false, isRecording: false });
            this.props.onError(error);
        }
    };

    onStopRecord = async () => {
        try {
            const path = await AudioRecord.stop();
            this.setState({ path:`file://${path}`, recorded: true, isRecording: false });
        } catch (err) {
            this.setState({ recorded: false, isRecording: false });
            this.props.onError(err);
        }
    };
    onConfirm = async () => {
        this.props.onConfirm(this.state.path, this.filename);
        this.onClose();
    }
    onClose = async () => {
        AudioRecord.stop();
        this.setState({ path: null, recorded: false, isRecording: false });
        this.props.onClose();
    }
    renderWave(isRecording) {
        return (
            <Wave
                style={[styles.waveBall, !isRecording && { display: 'none' }]}
                H={70}
                waveParams={[
                    { A: 10, T: 180, fill: BaseColor.lightPrimary2Color },
                    { A: 15, T: 140, fill: BaseColor.darkPrimary2Color },
                    { A: 20, T: 100, fill: BaseColor.primary2Color },
                ]}
                animated={!isRecording}
            />
        )
    }
    render() {
        const { visible, isRecording, recorded } = this.state;
        return (
            <Overlay isVisible={visible} overlayStyle={{ backgroundColor: BaseColor.blackDarkOpacity, borderRadius: 8 }} onBackdropPress={() => { }}>
                <>
                    <View style={styles.container}>
                        {this.renderWave(isRecording)}
                        {this.renderWave(!isRecording)}
                        <View style={styles.time}>
                            <TimerView isPlay={isRecording} title2 whiteColor bold />
                        </View>
                        <View style={{ marginTop: 10 }}>
                            <RecordingButton
                                isRecording={isRecording}
                                style={{
                                    transform: [{ scale: 0.6 }]
                                }}
                                onPress={isRecording ? this.onStopRecord.bind(this) : recorded ? this.onConfirm.bind(this) : this.onStartRecord.bind(this)}
                                showSend={recorded}
                            />
                        </View>
                    </View>
                    <View style={{ position: "absolute", top: 10, right: 10 }}>
                        <Image noloading onPress={this.onClose.bind(this)} nopreview source={Images.ic_times} style={{ width: 18, height: 18 }} />
                    </View>
                </>
            </Overlay>
        )
    }
}

Index.propTypes = {
};

Index.defaultProps = {
};
