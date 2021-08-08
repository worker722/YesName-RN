import { Icon, Text } from "@components";
import { BaseColor, BaseConfig } from "@config";
import { getDeviceWidth, image_uri } from "@utils";
import React, { Component } from "react";
import { Image, TouchableOpacity, View } from "react-native";


let HEIGHT = 180;
let MAXWIDTH = getDeviceWidth() * .8;
const getWidth = (width, height) => {
    return width * HEIGHT / height;
}
const getHeight = (width, height) => {
    return height * MAXWIDTH / width;
}

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: 120,
            height: 100,
            gif_paused: true,
        };
        this.isgif = !!(props.preview);
    }
    componentDidMount() {
        if (!this.isgif) {
            return;
        }
        const { width, height, url } = this.props;
        if (width && height) {
            this.setState({ ...this.getMediaSize(width, height) });
        } else {
            Image.getSize(image_uri(url).uri, (width, height) => {
                this.setState({ ...this.getMediaSize(width, height) });
            });
        }
        // setTimeout(() => {
        //     this.playGif();
        // }, 2000);
    }
    playGif() {
        this.props.onVisiteMessage();
        this.setState({ gif_paused: false });
        if (this.isgif) {
            this.timer = setTimeout(() => {
                this.setState({ gif_paused: true });
            }, 5000);
        }
    }
    getMediaSize(mediaW, mediaH) {
        // MAXWIDTH
        if (mediaW < mediaH) {
            MAXWIDTH = 180;
        }
        let height = HEIGHT;
        let width = getWidth(mediaW, mediaH);
        if (width > MAXWIDTH || MAXWIDTH == 180) {
            width = MAXWIDTH;
            height = getHeight(mediaW, mediaH);
        }
        return { width, height };
    }
    render() {
        const { width, height, gif_paused } = this.state;
        const { preview, url, onpreview, onLongPress, isVisited } = this.props;
        const urls = url?.split(BaseConfig.URLSPLITTER);
        const imageCount = urls?.length;
        return (
            <TouchableOpacity
                activeOpacity={.9}
                onLongPress={onLongPress}
                onPress={() => onpreview && onpreview(url?.split(BaseConfig.URLSPLITTER), this.isgif)}
                style={{ flexDirection: "row" }}>
                {this.isgif ?
                    <>
                        <Image
                            source={image_uri(gif_paused ? preview : url)}
                            resizeMode={'contain'}
                            blurRadius={isVisited ? 60 : 0}
                            style={{ width, height }} />
                        {gif_paused && !isVisited &&
                            <View style={{
                                backgroundColor: BaseColor.blackOpacity2,
                                flex: 1,
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <TouchableOpacity
                                    onPress={this.playGif.bind(this)}
                                    style={{ backgroundColor: BaseColor.blackOpacity, borderRadius: 9999, width: 60, height: 60, justifyContent: "center", alignItems: "center" }}>
                                    <Text whiteColor headline>GIF</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </>
                    :
                    <>
                        {urls?.splice(0, 2).map((item, index) => {
                            let frame_width = width;
                            let frame_height = height;
                            if (imageCount == 1) {
                                frame_width = width * 2;
                                frame_height = height * 2;
                            }
                            return (
                                <View key={index}>
                                    <Image
                                        source={image_uri(item)}
                                        resizeMode={'cover'}
                                        blurRadius={isVisited ? 60 : 0}
                                        style={{ width: frame_width, height: frame_height, margin: 4, borderRadius: 8, }} />
                                    {index == 1 && imageCount > 2 &&
                                        <View style={{
                                            position: "absolute",
                                            width: frame_width,
                                            height: frame_height,
                                            margin: 4,
                                            borderRadius: 8,
                                            backgroundColor: BaseColor.blackOpacity,
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <Icon name={'plus'} size={30} color={BaseColor.whiteColor} />
                                        </View>
                                    }
                                </View>
                            )
                        })}
                    </>
                }
            </TouchableOpacity>
        )
    }
}