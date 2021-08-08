import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
    basecontainer: {
        flex: 1,
        backgroundColor: BaseColor.primaryColor
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: BaseColor.primaryColor
    },
    HCenter: {
        alignItems: "center"
    },
    VCenter: {
        justifyContent: "center"
    },
    flexRow: {
        flexDirection: "row",
        marginVertical: 10,
    },

    containers: {
        flex: 1,
        paddingHorizontal: "8%"
    },
    username: {
        marginTop: 15,
        marginBottom: 8,
    },
    remoteStream: {
        width: "100%",
        height: "100%"
    },
    draggableView: {
        borderColor: BaseColor.mintgreen,
        borderWidth: 2,
        position: "absolute",
        flex: 1,
        backgroundColor: "#00000000",
        width: 100,
        height: 140
    },
    mystream: {
        width: 100,
        height: 140
    },
    toolbar: {
        zIndex:999,
        position: "absolute",
        width: "100%",
        bottom: "10%",
        paddingHorizontal: 20
    },
    hide: {
        position: "absolute",
        width: 0,
        height: 0,
        borderWidth: 0,
        top: -200,
        right: -200
    }
});