import { BaseColor, Images } from "@config";
import React, { Component } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Image } from 'react-native';

export default class RecordingButton extends Component {
    state = {
        animated: new Animated.Value(0.4),
        opacityA: new Animated.Value(1),
    }
    constructor(props) {
        super(props);
    }
    _runAnimation() {
        const { animated, opacityA } = this.state;

        Animated.loop(
            Animated.parallel([
                Animated.timing(animated, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false
                }),
                Animated.timing(opacityA, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false
                })
            ])
        ).start();
    }
    _stopAnimation() {
        Animated.loop(
            Animated.parallel([
                Animated.timing(animated),
                Animated.timing(opacityA)
            ])
        ).stop();
    }
    _micButton() {
        const { animated, opacityA, } = this.state;
        const { isRecording } = this.props;
        if (isRecording) {
            this._runAnimation();
            return (
                <Animated.View style={[styles.button, {
                    opacity: opacityA,
                    justifyContent: "center",
                    alignItems: "center",
                    transform: [{ scale: animated }]
                }]}>
                    <View style={[styles.button, { width: 50, height: 50 }]} />
                </Animated.View>
            );
        } else {
            return <View style={styles.button} />
        }
    }
    render() {
        const { onPress, onLongPress, style, showSend } = this.props;
        return (
            <View style={[styles.container, style]}>
                <TouchableOpacity
                    style={styles.frame}
                    onPress={() => (onPress && onPress())}
                    onLongPress={() => (onLongPress && onLongPress())}>
                    {showSend ?
                        <View style={[styles.button, styles.sendbutton]}>
                            <Image source={Images.send} style={{ width: 50, height: 50 }} resizeMode={'contain'} />
                        </View>
                        :
                        this._micButton()
                    }
                </TouchableOpacity>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    frame: {
        padding: 4,
        borderRadius: 1000,
        borderColor: BaseColor.primaryColor,
        borderWidth: 3,
    },
    button: {
        width: 65,
        height: 65,
        borderRadius: 50,
        backgroundColor: BaseColor.redColor,
    },
    sendbutton: {
        backgroundColor: BaseColor.primary2Color,
        justifyContent: "center",
        alignItems: "center"
    }
});