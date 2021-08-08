
import { Text } from "@components";
import { BaseColor } from "@config";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View } from "react-native";
import styles from "./styles";

export default class index extends Component {
    render() {
        let { value, color, txtcolor, style, size, topLeft, topRight, bottomLeft, bottomRight } = this.props;
        if (!value || value <= 0) return null;
        if (value >= 100) {
            value = `${99}+`;
        }
        return (
            <View style={[
                styles.badge,
                { backgroundColor: color },
                size && { width: size, height: size },
                topLeft && styles.topLeft,
                topRight && styles.topRight,
                bottomLeft && styles.bottomLeft,
                bottomRight && styles.bottomRight,
                style]}>
                <Text whiteColor caption2 style={{ color: txtcolor }}>{value}</Text>
            </View>
        )
    }
}
index.propTypes = {
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    value: PropTypes.number,
    color: PropTypes.string,
    txtcolor: PropTypes.string,
};

index.defaultProps = {
    value: 0,
    color: BaseColor.primary2Color,
    txtcolor: BaseColor.whiteColor,
    style: {}
};
