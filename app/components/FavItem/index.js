import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native';
import { MessageComponent, Avatar, Text, Icon } from "@components";
import { BaseColor, BaseConfig } from "@config";
import * as reduxActions from "@actions";
import { connect } from 'react-redux';
import { date2str } from "@utils";

const { CONTENTTYPE } = BaseConfig;
const { logger } = reduxActions;

class index extends Component {
    get user() {
        try {
            const { message: { sender: userid }, users: { users } } = this.props;
            const user = users.find(item => item.id == userid);
            return user || {};
        } catch (error) {
            logger.error(error);
        }
        return {};
    }
    render() {
        const { message, quote, cur_playing_audio, navigation, longPressMessage, onAudioPlay, onPress, onLongPress } = this.props;
        if (!message.content && !message.quote && !message.attach) return null;
        return (
            <TouchableOpacity style={{ margin: 15, marginTop: 15, justifyContent: "center" }} disabled={!onPress && !onLongPress} onPress={onPress} onLongPress={onLongPress}>
                <View style={{ flexDirection: "row", paddingHorizontal: 10, justifyContent: "center", alignItems: "center" }}>
                    <Avatar size={'small'} user={this.user} />
                    <Text whiteColor headline style={{ flex: 1, marginHorizontal: 12 }}>{this.user.name}</Text>
                    <Text whiteColor subhead>{date2str(message.created_at)}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                    <MessageComponent
                        cur_playing_audio={cur_playing_audio}
                        navigation={navigation}
                        quote={quote}
                        message={{ ...message, quote }}
                        disableLongPress={message.type == CONTENTTYPE.STORY}
                        onAudioPlay={() => onAudioPlay(message.id)}
                        onLongPress={longPressMessage}
                        componentonly
                        disableLongPress
                    />
                    <View style={{ paddingHorizontal: 20 }}>
                        <Icon name={'angle-right'} size={25} color={BaseColor.grayColor} />
                    </View>
                </View>
                <View style={{ flex: 1, backgroundColor: BaseColor.grayColor, height: 1, marginHorizontal: 20, marginTop: 10 }} />
            </TouchableOpacity>
        )
    }
}

const mapStateToProps = (state) => (state)

const mapDispatchToProps = {
    ...reduxActions
}

export default connect(mapStateToProps, mapDispatchToProps)(index)
