import * as reduxActions from "@actions";
import { ProgressBar, VideoPlayer } from "@components";
import { Images } from "@config";
import { getDeviceHeight, getDeviceWidth, image_uri, _MAX } from "@utils";
import React, { Component } from 'react';
import { Image, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import styles from "./styles.js";
const { logger } = reduxActions;
const ScreenWidth = getDeviceWidth(true);
const ScreenHeight = getDeviceHeight(true);

class PreviewReaction extends Component {
    state = {
        duration: 3,
        loaded: false
    }
    constructor(props) {
        super(props);
        const { route: { params: { message } } } = this.props;
        this.message = message;
    }
    componentDidMount() {
        this.props.showLoading(true);
    }
    componentWillUnmount() {
        this.props.showLoading(false);
    }
    onLoaded(item) {
        if (item.error) {
            logger.error("reaction play error", item);
            this.props.showToast("Can't play this video!")
            this.onTimeout();
        }
        const { duration } = this.state;
        setTimeout(() => {
            this.setState({ loaded: true, duration: item?.duration });
            this.props.showLoading(false);
        }, 1000);
    }
    async onTimeout() {
        this.props.showLoading(false);
        this.props.navigation.goBack();
    }
    render() {
        const { duration, loaded } = this.state;
        const { url, name, type, id } = this.message;
        return (
            <View style={styles.container}>
                <VideoPlayer
                    source={image_uri(url)}
                    onLoad={this.onLoaded.bind(this)}
                    onError={this.onLoaded.bind(this)}
                    style={{ width: ScreenWidth, height: ScreenHeight }}
                    resizeMode={'contain'}
                    paused={!loaded}
                />
                <ProgressBar duration={duration} isLoaded={loaded} onFinish={this.onTimeout.bind(this)} />
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

export default connect(mapStateToProps, mapDispatchToProps)(PreviewReaction);
