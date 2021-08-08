import { StyleSheet } from "react-native";

export default StyleSheet.create({
    badge: {
        width: 25,
        height: 25,
        borderRadius: 9999,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
    },
    topLeft: {
        position: "absolute",
        top: 0,
        left: 0
    },
    topRight: {
        position: "absolute",
        top: 0,
        right: 0
    },
    bottomRight: {
        position: "absolute",
        bottom: 0,
        right: 0
    },
    bottomLeft: {
        position: "absolute",
        bottom: 0,
        left: 0
    }
});
