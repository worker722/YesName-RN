import { BaseColor } from '@config';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        backgroundColor: BaseColor.whiteColor,
        flexDirection: "row",
    },
    quote_mark: {
        width: 10,
        backgroundColor: BaseColor.quoteColor
    },
    content: {
        margin: 10,
        marginBottom: 18,
        flex: 1
    },
    close: {
        position: "absolute",
        top: 4,
        right: 8
    }
});