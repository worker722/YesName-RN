import { BaseColor, BaseConfig } from "@config";
import { Platform, StyleSheet } from "react-native";
const { TABBAR_HEIGHT } = BaseConfig;
const top = Platform.OS == "ios" ? 8 : 2;

export default StyleSheet.create({
    tabbar: {
        height: TABBAR_HEIGHT,
        marginHorizontal: 2,
        backgroundColor: BaseColor.primary3Color,
        flexDirection: "row"
    },
    tab: {
        flex: 1,
        height: TABBAR_HEIGHT,
        resizeMode: "stretch",
        justifyContent:"center",
        alignItems:"center"
    },
    active: {
        paddingHorizontal: "2%"
    },
    tab_text: {
        marginTop: top,
    }
});