import { BaseColor } from "@config";
import { getDeviceHeight, getDeviceWidth } from "@utils";
import { StyleSheet } from "react-native";
// 100
const _WIDTH = getDeviceWidth();
const _HEIGHT = getDeviceHeight();
const height = (_WIDTH > +_HEIGHT ? _WIDTH : _HEIGHT) / 10;
export default StyleSheet.create({
    container: {
        flex: 1,
        marginVertical: 10,
    },
    gallery_item: {
        height: height,
        flex: 1,
    },
    border: {
        borderColor: BaseColor.primary2Color,
        borderWidth: 2,
        padding: 2,
        margin: 4,
    },
    border2: {
        marginVertical: 4,
    },
    row: {
        height: height * 2,
    },
    check_image: {
        position: "absolute",
        right: 5,
        top: 5,
        width: 23,
        height: 23
    },
    original: {
        flex: 1,
        width: "100%",
        height: "100%"
    },
    fav: {
        width: 30,
        height: 30,
        position: "absolute",
        top: 5,
        right: 5
    },
    reaction: {
        width: "60%",
        height: "60%",
        maxWidth: 90,
        position: "absolute",
        bottom: 0,
        left: 0,
        borderColor: BaseColor.mintgreen,
        borderWidth: 2,
        borderRadius: 10
    }
});
