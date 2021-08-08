import { StyleSheet } from "react-native";
import { BaseColor } from "@config";

export default StyleSheet.create({
    contain: {
        flex: 1,
        marginHorizontal: 15,
        marginVertical: 10,
        alignItems: "flex-start",
    },
    flexend: {
        marginTop: 6,
        alignItems: "flex-end",
    },
    message: {
        maxWidth: "80%",
        backgroundColor: BaseColor.whiteColor,
        borderRadius: 8,
        overflow: "hidden"
    },
    myMessage: {
        backgroundColor: "#f8d2cf"
    },
    textcontent: {
        paddingBottom: 10,
        paddingHorizontal: 20,
    },
    triangleCorner: {
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderRightWidth: 12,
        borderTopWidth: 12,
        borderRightColor: "transparent",
        borderTopColor: "white",
        marginHorizontal: 8,
        marginTop: -1,
    },
    rotate90: {
        transform: [{ rotate: "90deg" }],
        borderTopColor: "#f8d2cf",
    },
    quote: {
        minWidth: "60%",
        borderLeftColor: BaseColor.quoteColor,
        borderLeftWidth: 10,
        padding: 10
    },
    quote_mark: {
        width: 5,
        backgroundColor: BaseColor.quoteColor
    },
    quote_time: {
        width: "100%",
        textAlign: "right",
        paddingRight: 10,
        paddingTop: 5
    },
    sending: {
        backgroundColor: BaseColor.blackOpacity,
        width: "100%",
        height: "100%",
        left: 0,
        position: "absolute",
        justifyContent: "center",
        alignItems: "center"
    }
});
