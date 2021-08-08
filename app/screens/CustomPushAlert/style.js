import { BaseColor } from '@config';
import { getDeviceWidth } from '@utils';
import { StyleSheet } from "react-native";

const space = 3;
export const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 25,
        left: space,
        // right: 2,
        zIndex: 10000,
        elevation: 10000,
        backgroundColor: BaseColor.whiteColor,
        borderRadius: 12,
        width: getDeviceWidth() - (space * 2),
        minHeight: 80
    },
    main_contrainer: {
        margin: 20,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    times: {
        position: "absolute",
        top: 10,
        right: 10
    }
});

export default { styles };