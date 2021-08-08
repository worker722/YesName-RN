import { Text } from "@components";
import { BaseConfig, Images } from "@config";
import { image_uri } from "@utils";
import React, { Component } from "react";
import { Image, View } from "react-native";
import styles from "../styles";

export default class index extends Component {
    render() {
        const { previewStory, isVisited } = this.props;
        let media_link = '';
        if (previewStory) {
            media_link = previewStory.link.split(BaseConfig.URLSPLITTER);
            if (previewStory.type != 0) {
                if (media_link.length > 1) {
                    media_link = media_link[1];
                } else {
                    media_link = '';
                }
            }
        }

        return (
            <View style={{ flexDirection: "row" }}>
                <View style={styles.quote_mark} />
                <View style={{ paddingHorizontal: 10 }}>
                    <Text subline>Commented</Text>
                    {!!previewStory ?
                        <Image source={image_uri(previewStory.type == 0 ? previewStory.link : media_link, "uri", Images.ic_gallery)} style={{ width: 200, height: 160, marginTop: 4 }} resizeMode={'cover'} blurRadius={isVisited ? 100 : 0} />
                        :
                        <Text>Deleted story</Text>
                    }
                </View>
            </View>
        )
    }
};