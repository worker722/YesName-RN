import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingHorizontal: 8,
        borderBottomColor: BaseColor.grayColor,
        borderBottomWidth: 1,
        marginHorizontal: 5,
        paddingBottom: 10,
        marginTop: 10,
    },
    center: {
        justifyContent: "center",
        alignItems: "center"
    },
    contain: {
        flex: 1,
        paddingHorizontal: 14,
        justifyContent: "flex-end",
        paddingTop: 8
    },
    margin_bottom_sm: {
        marginBottom: 6
    }
});
