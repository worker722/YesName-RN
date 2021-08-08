
import * as reduxActions from "@actions";
import { Avatar, Icon, Text } from "@components";
import { BaseColor, BaseConfig } from "@config";
import { date2str } from "@utils";
import React, { Component } from "react";
import { TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";

class index extends Component {
    render() {
        const { data: { user, created_at, roomid, type, end_state }, onPress, auth: { user: { id: myid } } } = this.props;
        let receive = true;
        const missed = end_state == "missed";
        const duration = parseInt(end_state || "0") || 0;
        try {
            let caller_id = roomid?.split("_")?.[1];
            if (parseInt(caller_id) == myid) {
                receive = false;
            }
        } catch (error) {
        }
        const color = receive ? BaseColor.redColor : BaseColor.mintgreen;
        const call_icon = receive ? (missed ? 'call-missed' : 'phone-incoming') : (missed ? 'call-missed-outgoing' : 'phone-outgoing');

        var str_duration = null;
        if (duration > 0) {
            var moment = require("moment");
            const du = moment.duration(duration, "seconds");
            const _h = du.hours(), _m = du.minutes(), _s = du.seconds();
            const st_par = (v, str) => v > 0 ? `${v} ${str}${v > 1 ? 's' : ''}` : '';
            str_duration = ` ${st_par(_h, "hour")} ${st_par(_m, "min")} ${st_par(_s, "sec")}`;
        }

        return (
            <TouchableOpacity onPress={onPress} style={[styles.container, styles.center]}>
                <Avatar size={'medium'} user={user}
                    renderBottomRight={
                        <View style={{ backgroundColor: "#fff", borderRadius: 999, width: 28, height: 28, alignItems: "center", justifyContent: "center" }}>
                            <Icon name={type == BaseConfig.CALL.VIDEO ? 'video' : 'phone'} size={16} color={BaseColor.primaryColor} />
                        </View>
                    } />
                <View style={styles.contain}>
                    <Text whiteColor title3 style={styles.margin_bottom_sm}>{user.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Icon name={call_icon} size={20} color={color} type={call_icon == "call-missed-outgoing" ? 'MaterialIcons' : 'MaterialCommunityIcons'} />
                        {!!str_duration &&
                            <Text subhead style={{ color }}>{str_duration}</Text>}
                    </View>
                </View>
                <View style={{ justifyContent: "center", alignItems: "flex-end" }}>
                    <Text grayColor subhead style={styles.margin_bottom_sm}>{date2str(created_at)}</Text>
                </View>
            </TouchableOpacity>
        )
    }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(index);
