import { StyleSheet } from "react-native";

export default StyleSheet.create({
    header: {
        paddingHorizontal: 0,
        flexDirection: "row",
        width: "100%",
        marginTop: 20,
    },
    profile_mask: {
        position: "absolute",
        bottom: 0,
        right: 0,
    },
    user_profile: {
        position: "absolute",
        bottom: -6,
        alignItems: "center",
        width: "100%",
        left: 0,
        paddingHorizontal: 20,
        height: "100%",
    },
    user_name: {
        padding: 10,
        paddingHorizontal: 30,
        borderRadius: 8,
        overflow: "hidden"
    },
    user_state: {
        marginTop: 12
    },
});
