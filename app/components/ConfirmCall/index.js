import { Avatar, Icon, Text } from "@components";
import { BaseColor, BaseConfig } from "@config";
import React, { Component } from "react";
import { TouchableOpacity, View } from "react-native";
import styles from "./styles";


export default class index extends Component {
    render() {
        const { user, visible, onConfirm, onCancel } = this.props;
        if (!visible) return <></>;
        return (
            <View style={[styles.container, styles.center]}>
                <View style={[styles.contain, styles.center]}>
                    <Avatar size={'large'} user={user} />
                    <Text headline style={styles.username}>{user?.name}</Text>
                    <Text subhead>{user?.phone}</Text>
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => onConfirm(BaseConfig.CALL.VOICE)} style={[styles.voice_action, styles.center]}>
                            <Icon name={'phone-alt'} size={24} color={BaseColor.whiteColor} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onConfirm(BaseConfig.CALL.VIDEO)} style={[styles.voice_action, styles.center]}>
                            <Icon name={'video'} size={24} color={BaseColor.whiteColor} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={onCancel} style={[styles.close_action, styles.center]}>
                        <Icon name={'times'} size={24} color={BaseColor.blackColor} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}
