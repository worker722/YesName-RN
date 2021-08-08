import React, { Component } from 'react'
import { FlatList, SafeAreaView, RefreshControl } from 'react-native'
import { connect } from 'react-redux'
import styles from "./styles";
import * as reduxActions from "@actions";
import { Header, Icon, FavItem } from "@components";
import { BaseColor, BaseConfig } from "@config";
const { ApiActions, logger } = reduxActions;
const { CONTENTTYPE } = BaseConfig;

export class index extends Component {
    state = {
        cur_playing_audio: 0,
        allmessages: []
    }
    componentDidMount() {
        this.refresh();
        this.focusListener = this.props.navigation.addListener("focus", this.refresh.bind(this));
        this.blurListener = this.props.navigation.addListener("blur", this.props.showLoading.bind(this, false));
    }
    componentWillUnmount() {
        try {
            this.focusListener.remove();
            this.blurListener.remove();
        } catch (error) {

        }
    }
    refresh() {
        this.props.showLoading(true);
        ApiActions.getAllMessages()
            .then(res => {
                this.setState({ allmessages: res.messages });
            })
            .catch(err => {
                console.error(err);
                this.setState({ allmessages: [] });
            })
            .finally(() => {
                this.props.showLoading(false);
            });
    }
    onGoBack() {
        this.props.navigation.goBack();
    }
    onAudioPlay(id) {
        this.setState({
            cur_playing_audio: id
        });
    }
    goChat({ roomid, id: messageid }) {
        const { chat: { rooms, messages } } = this.props;
        if (!rooms.find(item => item.roomid == roomid)) {
            return;
        }
        if (!messages.find(item => item.id == messageid)) {
            return;
        }
        this.props.navigation.navigate("Chat", { roomid, messageid });
    }
    removeFromFav(msg) {
        this.props.showAlert({
            title: "Confirm",
            message: "Do you really want to delete from favourite?",
            textConfirm: "Yes",
            textCancel: "No",
            visible: true,
            onConfirm: () => {
                this.props.chatRemoveFromFavourite(msg.id);
            },
        })
    }
    get favourite() {
        const { allmessages } = this.state;
        const { chat: { favourites } } = this.props;
        var favourite = favourites
            .map(item => ({ ...allmessages?.find(msg => msg.id == item) }))
            .sort((a, b) => b.id - a.id);
        return favourite;
    }
    getMessage(item) {
        if (item.quoteid > 0 && item.type != CONTENTTYPE.STORY && item.type != CONTENTTYPE.REACTION && item.type != CONTENTTYPE.REPLY_REACTION) {
            const { allmessages } = this.state;
            const quote = allmessages?.find(msg => msg.id == item.quoteid);
            return quote;
        }
        return null;
    }
    renderFavItem({ item, index }) {
        const { cur_playing_audio } = this.state;
        return (
            <FavItem
                message={item}
                cur_playing_audio={cur_playing_audio}
                navigation={this.props.navigation}
                onAudioPlay={this.onAudioPlay.bind(this)}
                onPress={this.goChat.bind(this, item)}
                onLongPress={this.removeFromFav.bind(this, item)}
                quote={this.getMessage(item)}
            />
        )
    }
    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Header
                    title={"Favourite"}
                    renderLeft={<Icon name={'angle-left'} size={24} />}
                    onPressLeft={this.onGoBack.bind(this)}
                />
                <FlatList
                    data={this.favourite}
                    keyExtractor={(_, index) => index.toString()}
                    inverted
                    renderItem={this.renderFavItem.bind(this)}
                    refreshControl={
                        <RefreshControl
                            colors={[BaseColor.primaryColor]}
                            refreshing={false}
                            onRefresh={this.refresh.bind(this)} />
                    }
                />
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => (state)

const mapDispatchToProps = {
    ...reduxActions
}

export default connect(mapStateToProps, mapDispatchToProps)(index)
