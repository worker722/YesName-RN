
import { Avatar, Image, Text } from "@components";
import { Images } from "@config";
import React, { Component } from "react";
import { TouchableOpacity, View } from "react-native";
import styles from "./styles";
export default class index extends Component {
    render() {
        const { style, onPress, selected, markable, user } = this.props;
        let phone = '';
        try {
            if (typeof user.phone == "string") {
                phone = user.phone;
            } else if (typeof user.phone == "object" && user?.phone?.length > 0) {
                phone = user.phone[0]?.number
            } else {
                phone = '';
            }
        } catch (error) {
        }
        return (
            <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
                <View>
                    <Avatar user={user} size={"medium"} />
                    {user.star && markable &&
                        <View style={styles.star_contain}>
                            <Image noloading source={Images.ic_star} style={styles.star} />
                        </View>
                    }
                </View>
                <View style={styles.contain}>
                    {!!user?.name && <Text body1 whiteColor numberOfLines={1}>{user.name}</Text>}
                    {!!phone && <Text body2 whiteColor style={{ marginTop: 8 }} numberOfLines={1}>{phone}</Text>}
                </View>
                {!user.star && markable &&
                    <Image noloading onPress={onPress} source={Images.ic_check[selected ? "checked" : "unchecked"]} style={styles.cheeckbox} />
                }
            </TouchableOpacity>
        )
    }
}
