import { BaseColor, Images } from "@config";
import { image_uri } from "@utils";
import React, { Component } from "react";
import { Image, TouchableOpacity, View } from "react-native";

export default class index extends Component {
    constructor(props) {
        super(props);
        const { replyReaction } = this.props;
        this.reply_attach = null
        try {
            this.reply_attach = JSON.parse(replyReaction.attach);
        } catch (error) {
        }
    }
    render() {
        const { attach: { type, url, thumbnail }, isVisited, onPress, onLongPress, mine } = this.props;
        const is_hidden = (this.replyReaction?.etc == 2 || this.replyReaction?.etc == 3);
        return (
            <TouchableOpacity
                activeOpacity={.9}
                onPress={onPress}
                onLongPress={onLongPress}
            >
                <Image source={type == 0 ? url : image_uri(thumbnail?.path, "uri", Images.ic_gallery)} style={{ width: 160, height: 180 }} resizeMode={'cover'} blurRadius={isVisited ? 100 : 0} />
                {this.reply_attach &&
                    <View
                        style={[{
                            position: "absolute",
                            bottom: -10,
                            borderRadius: 16,
                            borderColor: is_hidden ? BaseColor.danger : BaseColor.success,
                            borderWidth: 2,
                            overflow: "hidden",
                        }, mine ? { left: 4 } : { right: 4 }]}>
                        <Image source={image_uri(this.reply_attach.type == 0 ? this.reply_attach.url : this.reply_attach?.thumbnail?.path, "uri", Images.ic_gallery)} style={{ width: 70, height: 80 }} resizeMode={'cover'} blurRadius={isVisited ? 100 : 0} />
                    </View>
                }
            </TouchableOpacity>
        )
    }
}