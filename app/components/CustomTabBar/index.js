import { Text } from "@components";
import { Images } from "@config";
import React, { Component } from "react";
import { ImageBackground, TouchableOpacity, View } from "react-native";
import styles from "./styles";

export default class index extends Component {
    render() {
        const { tabLabels, onPress, active, style } = this.props;
        return (
            <View style={[styles.tabbar, style]}>
                {tabLabels.map((item, index) => {
                    const position = index == 0 ? "left" : index == tabLabels.length - 1 ? "right" : "center";
                    return (
                        <View style={{ flex: 1 }} key={index}>
                            {index == active ?
                                <ImageBackground resizeMode={"stretch"} source={Images.tab_back[position]} style={[styles.tab, styles.active]}>
                                    <Text whiteColor headline style={styles.tab_text}>{item}</Text>
                                </ImageBackground>
                                :
                                <TouchableOpacity style={styles.tab} onPress={() => onPress(index)}>
                                    <Text whiteColor headline style={styles.tab_text}>{item}</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    )
                })}
            </View>
        );
    }
}