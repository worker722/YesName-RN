
import { BaseColor } from "@config";
import { checkString, image_uri } from "@utils";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar } from 'react-native-elements';

export default class index extends Component {
    render() {
        const { style, onPress, size, user, defavatar, renderTopLeft, renderTopRight, renderBottomLeft, renderBottomRight } = this.props;
        let first_letter = "";
        try {
            first_letter = user?.name?.charAt(0)?.toUpperCase();
        } catch (err) {
        }
        return (
            <TouchableOpacity activeOpacity={onPress ? .7 : 1} onPress={onPress} style={{ position: "relative" }}>
                <Avatar
                    rounded
                    {...((defavatar || checkString(user?.avatar)) && { source: image_uri(user?.avatar) })}
                    size={size}
                    title={first_letter}
                    containerStyle={[{ backgroundColor: user?.backgroundColor || "#adf0d1", overflow: "hidden" }, style]}
                    titleStyle={{ color: BaseColor.primaryColor }}
                />
                {renderTopLeft && <View style={styles.topLeft}>{renderTopLeft}</View>}
                {renderTopRight && <View style={styles.topRight}>{renderTopRight}</View>}
                {renderBottomLeft && <View style={styles.bottomLeft}>{renderBottomLeft}</View>}
                {renderBottomRight && <View style={styles.bottomRight}>{renderBottomRight}</View>}
            </TouchableOpacity>
        )
    }
}

index.propTypes = {
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    onPress: PropTypes.func,
    avatar: PropTypes.any,
    size: PropTypes.any,
    user: PropTypes.object,
    defavatar: PropTypes.bool,
};

index.defaultProps = {
    style: {},
    onPress: () => { },
    avatar: "",
    size: "medium",
    user: {},
    defavatar: false
};
const styles = StyleSheet.create({
    topLeft: {
        position: "absolute",
        top: -5,
        left: -5
    },
    topRight: {
        position: "absolute",
        top: -5,
        right: -5
    },
    bottomLeft: {
        position: "absolute",
        bottom: -5,
        left: -5
    },
    bottomRight: {
        position: "absolute",
        bottom: -5,
        right: -5
    },
});
