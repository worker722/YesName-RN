
import { Icon, Text } from "@components";
import { BaseColor, Images } from "@config";
import React, { Component } from "react";
import { ImageBackground, TouchableOpacity, Image } from "react-native";
import styles from "./styles";

export default class index extends Component {
    render() {
        const { style, renderLeft, title, renderRight, onPressLeft, OnPressRight, renderCenter, onPressName, leftBack, security, showLogo } = this.props;
        return (
            <ImageBackground source={Images[security ? 'header1_back' : 'header_back']} style={[styles.container, style]} resizeMode={"stretch"}>
                <TouchableOpacity onPress={onPressLeft} style={{ width: 50 }}>
                    {leftBack ? <Icon name={'angle-left'} size={25} color={BaseColor.blackColor} /> : renderLeft}
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={onPressName ? .7 : 1} onPress={onPressName} style={{ flex: 1, alignItems: "center" }}>
                    {
                        renderCenter ? renderCenter
                            :
                            showLogo ?
                                <Image source={Images.logo} style={{ height: "85%", marginTop: "4%", width:"70%" }} resizeMode={'contain'} />
                                :
                                <Text blackColor title3>{title}</Text>
                    }
                </TouchableOpacity>
                <TouchableOpacity onPress={OnPressRight} style={{ width: 50, alignItems: "flex-end" }}>
                    {renderRight}
                </TouchableOpacity>
            </ImageBackground>
        )
    }
}

