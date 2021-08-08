
import { Avatar, Text } from "@components";
import React, { Component } from "react";
import { View } from "react-native";
import { BaseColor } from "@config";

export default class Contacts extends Component {
    render() {
        const { data, isVisited } = this.props;
        if (!data) return <></>;
        const user = isVisited ? { ...data, backgroundColor: BaseColor.grayColor } : data;
        return (
            <View style={{ flexDirection: "row", paddingHorizontal: 10, paddingTop: 10, minWidth: "50%" }}>
                <Avatar user={user} size={"medium"} />
                <View style={{ marginLeft: 10 }}>
                    {!!data.name && <Text headline bold style={{ flex: 1 }} grayColor={isVisited}>{data.name}</Text>}
                    {!!data.phone && <Text subhead grayColor style={{ marginTop: 4, marginRight: 5 }}>{data.phone}</Text>}
                </View>
            </View>
        )
    }
}