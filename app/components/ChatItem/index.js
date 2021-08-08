
import * as reduxActions from "@actions";
import { Avatar, Badge, Icon, Text } from "@components";
import { BaseColor, BaseConfig } from "@config";
import { date2str } from "@utils";
import React, { Component } from "react";
import { TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
const { MUTE_KEY, CONTENTTYPE } = BaseConfig;
class index extends Component {
    render() {
        const { room, room: { message, unreadcount }, onPress, users: { users }, auth: { user: { id: myid } }, app: { security } } = this.props;
        let roomids = room.roomid.split("_");
        let userid = roomids[1];
        if (userid == myid) {
            userid = roomids[2];
        }
        const user = users?.length > 0 ? users.find(item => item.id == (userid)) || {} : {};

        let content = message?.content;
        if (!content || content == "null") {
            switch (message?.type) {
                case CONTENTTYPE.AUDIO:
                    content = "Audio";
                    break;
                case CONTENTTYPE.CONTACTS:
                    content = "Contacts";
                    break;
                case CONTENTTYPE.FILE:
                    content = "File";
                    break;
                case CONTENTTYPE.IMAGE:
                    content = "Image";
                    try {
                        let msg_atach = JSON.parse(message?.attach);
                        if (msg_atach.preview) content = "Gif";
                    } catch (error) {
                    }
                    break;
                case CONTENTTYPE.LOCATION:
                    content = "Location";
                    break;
                case CONTENTTYPE.VIDEO:
                    content = "Video";
                    break;
                case CONTENTTYPE.FORWARD:
                    content = "Quoted message";
                    break;
                case CONTENTTYPE.STORY:
                    content = "Story comments";
                    break;
                case CONTENTTYPE.REACTION:
                case CONTENTTYPE.REPLY_REACTION:
                    content = "Reaction";
                    break;
            }
        }
        if (message?.quoteid > 0 && message?.type != CONTENTTYPE.STORY && message?.type != CONTENTTYPE.REACTION && message?.type != CONTENTTYPE.REPLY_REACTION) {
            content = "Quoted message";
        }
        const isMute = (room.mute == MUTE_KEY);
        const isMine = myid == message?.sender;
        if (!user?.name) return <></>

        return (
            <TouchableOpacity onPress={onPress} style={[styles.container, styles.center]}>
                <Avatar size={'medium'} user={user}
                    renderBottomRight={isMute &&
                        <View style={{ backgroundColor: BaseColor.primaryColor, width: 30, height: 30, borderRadius: 999, justifyContent: "center", alignItems: "center" }}>
                            <Icon color={BaseColor.whiteColor} name={"microphone-alt-slash"} size={18} />
                        </View>
                    } />
                <View style={styles.contain}>
                    <Text whiteColor title3 style={styles.margin_bottom_sm} numberOfLines={1}>{user.name}</Text>
                    <Badge style={{ position: "absolute", top: 0, right: 0, flexDirection: "row" }} value={unreadcount} />
                    <View style={{ flexDirection: "row" }}>
                        {!!content && <Text mintgreen={!isMine && !security} dangerColor={!isMine && security} grayColor={isMine} headline numberOfLines={1} style={{ flex: 1 }}>{content}</Text>}
                        {!!message?.created_at && <Text grayColor subhead style={styles.margin_bottom_sm}>{date2str(message?.created_at, 3)}</Text>}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(index);
