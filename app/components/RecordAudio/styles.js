import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 30,
    },
    waveBall: {
        width: 100,
        aspectRatio: 1,
        borderRadius: 50,
        overflow: 'hidden',
        transform: [{ scale: 1.2 }]
    },
    time: {
        position: "absolute",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 30
    },
    button: {
        padding: 10,
        marginTop: 30,
        backgroundColor: BaseColor.primary2Color
    }
});