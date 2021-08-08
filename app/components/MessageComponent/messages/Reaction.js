import { Image, Text } from "@components";
import { BaseColor, Images } from "@config";
import { image_uri } from "@utils";
import React, { Component } from "react";
import { TouchableOpacity, View } from "react-native";


export default class index extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { attach: { type, url, thumbnail }, answerable, hidden, onLongPress, onPress, onPreview, onCancel, isVisited } = this.props;
        const isHiddenReaction = (hidden == 2 || hidden == 3);
        return (
            <TouchableOpacity
                activeOpacity={.9}
                onLongPress={onLongPress}
                onPress={() => {
                    if (answerable) return
                    else {
                        if (isHiddenReaction) return
                        else onPreview?.()
                    }
                }}
                style={{ flexDirection: "row" }}>
                <Image nopreview noloading source={image_uri(type == 0 ? url : thumbnail?.path, 'uri', Images.ic_gallery)} style={{ width: 260, height: 180 }} resizeMode={'cover'} blurRadius={isVisited ? 100 : (isHiddenReaction || answerable) ? 25 : 0} />
                <View style={{ position: "absolute", right: 4, top: 4, flexDirection: "row", padding: 5 }}>
                    {isHiddenReaction ?
                        <>
                            <Image source={Images.reaction_text} style={{ width: 30, height: 30 }} noloading nopreview />
                            <Image source={Images.ic_security} style={{ width: 30, height: 30, marginLeft: 5 }} round noloading nopreview />
                        </>
                        :
                        <Image source={Images.reaction_text} style={{ width: 35, height: 35 }} noloading nopreview />
                    }
                </View>
                {answerable &&
                    <View style={{
                        position: "absolute",
                        flex: 1,
                        width: "100%",
                        height: "100%",
                        // flexDirection: "row",
                        paddingTop: 20,
                        paddingHorizontal: 10,
                        backgroundColor: BaseColor.blackOpacity
                    }}>
                        <Text title3 whiteColor style={{ textAlign: "center" }}>reaction-content-descript</Text>
                        <View style={{ flex: 1, flexDirection: "row", paddingHorizontal: 30, paddingTop: 10 }}>
                            <TouchableOpacity onPress={onCancel}>
                                <Image source={Images.cancel} style={{ width: 50, height: 50 }} noloading nopreview />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity onPress={onPress}>
                                <Image source={Images.check} style={{ width: 50, height: 50 }} noloading nopreview />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            </TouchableOpacity>
        )
    }
}