import { Platform, StyleSheet } from "react-native";
const ANDROID = Platform.OS == "android";
export default StyleSheet.create({
    container: {
        paddingHorizontal: 15,
        paddingTop: ANDROID ? 25 : 35,
        width: "100%",
        height: ANDROID ? 90 : 100,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    }
});
