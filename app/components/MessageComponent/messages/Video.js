import { Icon, Text } from "@components";
import { BaseColor, Images } from "@config";
import { image_uri } from "@utils";
import numbro from "numbro";
import React, { Component } from "react";
import { Image, TouchableOpacity, View } from "react-native";

export default class Video extends Component {
    constructor(props) {
        super(props);
        this.state = {
            duration: 0
        };
    }
    componentDidMount() {
        const { data: { url: mediaUrl } } = this.props;

        const url = image_uri(mediaUrl).uri;
    }
    componentWillUnmount() {
        try {
            this.soundInstance.stop();
            this.soundInstance.release();
        } catch (error) {
        }
    }
    render() {
        const { onpreview, data: { thumbnail, url, duration }, isVisited } = this.props;
        return (
            <View>
                <Image source={image_uri(thumbnail?.path, "uri", Images.ic_gallery)} style={{ width: 250, height: 200 }} resizeMode={'cover'} blurRadius={isVisited ? 80 : 0} />
                {!isVisited &&
                    <View style={{ zIndex: 999, position: "absolute", width: 250, height: 200, alignItems: "center", justifyContent: "center", backgroundColor: BaseColor.blackOpacity2 }}>
                        <TouchableOpacity
                            activeOpacity={.9}
                            onPress={onpreview}
                            style={{ width: 50, height: 50, backgroundColor: BaseColor.blackOpacity2, borderRadius: 999, justifyContent: "center", alignItems: "center", paddingLeft: 5 }}>
                            <Icon name={'play'} size={30} color={BaseColor.whiteColor} />
                        </TouchableOpacity>
                    </View>
                }
                <View style={{ zIndex: 999, position: "absolute", bottom: 0, width: 250, alignItems: "center", backgroundColor: BaseColor.blackOpacity2, padding: 5 }}>
                    <Text headline whiteColor>{numbro(Math.abs(duration || 0)).format('00:00:00')}</Text>
                </View>
            </View>
        )
    }
}