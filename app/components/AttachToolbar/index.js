import { BubbleImage } from "@components";
import { Images } from "@config";
import React, { Component } from "react";
import { ImageBackground, View } from "react-native";
import styles from "./styles";

export default class index extends Component {
    render() {
        const { visible_tools, security, attachTools } = this.props;
        return (
            <ImageBackground source={Images[visible_tools ? `toolbar${security ? '1' : ''}_back` : `toolbar${security ? '1' : ''}_header`]} resizeMode={"stretch"} style={styles.toolbar}>
                {visible_tools &&
                    <>
                        <View style={{ flexDirection: "row", marginVertical: 10 }}>
                            <BubbleImage onPress={() => attachTools(0)} source={Images.file} size={26} padding={12} flex />
                            <BubbleImage onPress={() => attachTools(1)} source={Images.cotnacts} size={26} padding={12} flex />
                            <BubbleImage onPress={() => attachTools(2)} source={Images.location} size={26} padding={12} flex />
                            <BubbleImage onPress={() => attachTools(3)} source={Images.gif} size={26} padding={12} flex />
                            <BubbleImage onPress={() => attachTools(4)} source={Images.ic_security} size={26} padding={12} flex />
                        </View>
                        <View style={{ flexDirection: "row", marginVertical: 10 }}>
                            <BubbleImage onPress={() => attachTools(5)} source={Images.image} size={26} padding={12} flex />
                            <BubbleImage onPress={() => attachTools(6)} source={Images.video} size={26} padding={12} flex />
                            <BubbleImage onPress={() => attachTools(7)} source={Images.call} size={26} padding={12} flex />
                            <BubbleImage onPress={() => attachTools(8)} source={Images.camera} size={26} padding={12} flex />
                            <BubbleImage onPress={() => attachTools(9)} source={Images.reaction_text} size={26} padding={12} flex />
                        </View>
                    </>
                }
            </ImageBackground>
        )
    }
}
