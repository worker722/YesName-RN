import { Text } from "@components";
import React, { Component } from "react";

export default class Index extends Component {
    state = {
        isPlay: false,
        recordingTime: 0,
    }
    constructor(props) {
        super(props);
        this.timer = null;
    }
    startTimer() {
        try {
            this.stopTimer();
        } catch (err) { }
        this.initTime = true;
        this.timer = setInterval(() => {
            let { recordingTime } = this.state;
            if (this.initTime) {
                recordingTime = 0;
                this.initTime = false;
            }
            this.setState({ recordingTime: recordingTime + 1 })
        }, 1000);
    }
    stopTimer() {
        clearInterval(this.timer);
        this.timer = null;
    }
    componentWillUnmount(){
        this.stopTimer();
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.isPlay !== this.state.isPlay) {
            this.setState({ isPlay: nextProps.isPlay });
            if (nextProps.isPlay) {
                this.startTimer();
            } else {
                this.stopTimer();
            }
        }
    }
    get getStringTime() {
        const { recordingTime } = this.state;
        let secs = parseInt(recordingTime % 60);
        let mins = parseInt(recordingTime / 60);
        if (secs <= 9) secs = `0${secs}`;
        if (mins <= 9) mins = `0${mins}`;
        return `${mins}:${secs}`;
    }
    render() {
        return <Text {...this.props}>{this.getStringTime}</Text>
    }
}

Index.propTypes = {
};

Index.defaultProps = {
};
