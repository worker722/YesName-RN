import * as reduxActions from "@actions";
import { BaseColor, BaseConfig, Images } from "@config";
import { compareDate, image_uri } from "@utils";
import React, { Component } from 'react';
import { Image, ImageBackground, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { connect } from "react-redux";
import styles from "./styles";

const { THEME_IMAGE_NUM } = BaseConfig;
class PhotoGrid extends Component {
    constructor(props) {
        super(props);
    }
    renderTheme(data, theme) {
        const { selectedItems, selectable, onPress, onLongPress } = this.props;
        const CustomImageBackground = (index, is2row) => {
            let selected = false;
            try {
                if (!data[index]?.attach) return null;
                selected = selectedItems?.indexOf(data[index].id) >= 0;
            } catch (err) { }
            let url = ``;
            let reaction_url = ``;
            if (data[index].type == 0) {
                url = data[index].attach?.url;
            } else {
                url = data[index].attach?.thumbnail?.path || '';
            }
            try {
                if (data[index].replyReaction?.type == 0) {
                    reaction_url = data[index].replyReaction?.url;
                } else {
                    reaction_url = data[index].replyReaction?.thumbnail?.path || '';
                }
            } catch (error) {
            }
            return (
                <TouchableOpacity
                    activeOpacity={.7}
                    onPress={() => {
                        if (!onPress) return;
                        onPress(data[index].attach)
                    }}
                    onLongPress={() => onLongPress && onLongPress(data[index])}
                    style={[
                        styles.gallery_item,
                        styles.border,
                        is2row && [styles.row, styles.border2]
                    ]}>
                    <Image source={image_uri(url, "uri", Images.ic_gallery)} style={styles.original} />
                    {selectable &&
                        <ImageBackground
                            source={Images.ic_check[selected ? "checked" : "unchecked"]}
                            resizeMode="cover"
                            style={styles.check_image} />
                    }
                    {data[index].fav &&
                        <Image resizeMode="cover" source={Images.ic_star} style={styles.fav} />
                    }
                    <Image resizeMode="cover" source={image_uri(reaction_url, "uri", Images.ic_gallery)} style={[styles.reaction, is2row && { width: 80 }]} />
                </TouchableOpacity>
            );
        }
        if (theme == 0) {
            return CustomImageBackground(0, true);
        } else if (theme == 1) {
            return (
                <>
                    {CustomImageBackground(0, true)}
                    {CustomImageBackground(1, true)}
                </>
            )
        } else if (theme == 2) {
            return (
                <>
                    {CustomImageBackground(0, true)}
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row" }}>
                            {CustomImageBackground(1)}
                            {CustomImageBackground(2)}
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            {CustomImageBackground(3)}
                            {CustomImageBackground(4)}
                        </View>
                    </View>
                </>
            )
        } else if (theme == 3) {
            return (
                <>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row" }}>
                            {CustomImageBackground(0)}
                            {CustomImageBackground(1)}
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            {CustomImageBackground(2)}
                            {CustomImageBackground(3)}
                        </View>
                    </View>
                    {CustomImageBackground(4, true)}
                </>
            )
        }
    }
    get galleryImages() {
        let { chat: { messages, rooms }, stories: { favourite, hideReaction }, show_favourite, auth: { user: { id: myid } } } = this.props;
        const checkGallery = (item) => {
            const chat_room = rooms.find(roomitem => roomitem.roomid == item.roomid);
            if (!chat_room) return false;
            if (chat_room?.security) return false;
            if (item.type != BaseConfig.CONTENTTYPE.REPLY_REACTION) return false;
            if (item.sender == myid) return false;
            if ((hideReaction || []).some(hide => hide == item.id)) return false;
            return true;
        }
        messages = (messages || [])
            .filter(checkGallery)
            .map((item, index) => {
                let attach = {};
                let replyReaction = {};
                try {
                    attach = JSON.parse(item.attach);
                } catch (error) {
                }
                try {
                    replyReaction = JSON.parse(item.replyReaction.attach);
                } catch (error) {
                }
                return { ...item, attach, replyReaction, fav: favourite.indexOf(item.id) >= 0 };
            });
        if (show_favourite) {
            messages = messages.filter(item => item.fav);
        }
        messages = messages.sort((a, b) => compareDate(a.created_at, b.created_at, false));
        return messages;
    }
    get getThemes() {
        let count = this.galleryImages.length;
        let themes = [];
        let index = 0;
        let total = 0;
        while (total < count) {
            if (index >= global.ReactionTheme.length - 1) index = 0;

            let themeindex = global.ReactionTheme[index];
            let theme = THEME_IMAGE_NUM[themeindex];
            if (count - total == 1) {
                themes.push(0);
                break;
            }
            else if (theme > count) {
                index++;
                continue;
            }

            total += theme;
            themes.push(themeindex);
            index++;
        }
        return themes;
    }

    render() {
        let data = [...this.galleryImages];
        if (data?.length > 0) { }
        else return <></>
        const themes = this.getThemes;
        return (
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        colors={[BaseColor.primaryColor]}
                        refreshing={false}
                        onRefresh={this.props.onRefresh} />
                }
            >
                {themes.map((item, index) => <View key={index.toString()} style={{ flexDirection: "row" }}>{this.renderTheme(data.splice(0, THEME_IMAGE_NUM[item]), item)}</View>)}
            </ScrollView>
        )
    }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = {
    ...reduxActions
}
export default connect(mapStateToProps, mapDispatchToProps)(PhotoGrid);