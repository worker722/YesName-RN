import { BubbleIcon, Image, Text } from "@components";
import { BaseColor, Images } from "@config";
import { getDeviceHeight, getDeviceWidth, image_uri } from "@utils";
import React, { Component } from "react";
import { ImageBackground, TouchableOpacity, View } from "react-native";
import styles from "./styles";
const _AVATAR_HEIGHT = getDeviceHeight() * 2 / 5;
const _DEVICE_WIDTH = getDeviceWidth();

export default class index extends Component {
    render() {
        let { user, onLayout, onPress, onBackPress, EDIT_TYPE, show_header, show_state, security } = this.props;
        if (!onLayout) onLayout = () => { };
        if (!EDIT_TYPE) EDIT_TYPE = {};
        return (
            <View style={{ width: _DEVICE_WIDTH, height: _AVATAR_HEIGHT }}>
                <Image
                    resizeMode={"cover"}
                    nopreview
                    noloading
                    source={image_uri(user.avatar)}
                    style={{ width: _DEVICE_WIDTH, height: _AVATAR_HEIGHT }}
                    backgroundColor={BaseColor.primary2Color}
                />
                <View style={styles.profile_mask}>
                    <Image
                        noloading
                        resizeMode={'stretch'}
                        nopreview
                        source={Images.profile_avatar_mask}
                        style={{ width: _DEVICE_WIDTH, height: _AVATAR_HEIGHT, marginBottom: -2 }}
                    />
                </View>
                <View style={styles.user_profile}>
                    <View style={[styles.header, styles.center]}>
                        <BubbleIcon size={26} onPress={onBackPress} name={"angle-left"} styles={{ marginBottom: 10 }} />

                        <View style={{ flex: 1 }} />
                        {show_header &&
                            <BubbleIcon
                                onLayout={(event) => onLayout(event, EDIT_TYPE?.CHANGE_PICTURE)}
                                onPress={() => onPress(EDIT_TYPE?.CHANGE_PICTURE)}
                                size={26}
                                name={"plus"}
                                styles={{ marginBottom: 10 }}
                            />
                        }
                    </View>
                    <View style={{ flex: 1 }} />
                    {<TouchableOpacity
                        activeOpacity={onPress ? .7 : 1}
                        onLayout={(event) => onLayout(event, EDIT_TYPE?.CHANGE_NAME)}
                        onPress={() => onPress?.(EDIT_TYPE?.CHANGE_NAME)}
                    >
                        <ImageBackground
                            source={Images[security ? 'header1_back' : 'header_back']}
                            resizeMode={"stretch"}
                            style={styles.user_name}>
                            <Text headline numberOfLines={1}>{user.name || "user name"}</Text>
                        </ImageBackground>
                    </TouchableOpacity>}
                    {show_state ?
                        <TouchableOpacity
                            activeOpacity={onPress ? .7 : 1}
                            onLayout={(event) => onLayout(event, EDIT_TYPE?.CHANGE_STATE)}
                            onPress={() => onPress?.(EDIT_TYPE?.CHANGE_STATE)}
                        >
                            <ImageBackground
                                source={Images[security ? 'header1_back' : 'header_back']}
                                resizeMode={"stretch"}
                                style={[styles.user_name, styles.user_state]}>
                                <Text headline numberOfLines={1}>{user.state}</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                        :
                        <View style={{ height: 45 }} />}
                </View>
            </View>
        )
    }
}
