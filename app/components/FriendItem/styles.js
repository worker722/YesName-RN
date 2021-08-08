import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        borderTopColor: BaseColor.grayColor,
        borderBottomColor: BaseColor.grayColor,
        borderBottomWidth: .4,
        borderTopWidth: .4
    },
    selected: {
        backgroundColor: BaseColor.primaryOpacity,
    },
    contain: {
        flex: 1,
        marginHorizontal: 20
    },
    star_contain: {
        position: "absolute",
        right: -5,
        top: -5
    },
    star: {
        width: 20,
        height: 20,
    },
    cheeckbox: {
        width: 30,
        height: 30
    }
});
