
import * as reduxActions from "@actions";
import { Text } from "@components";
import { BaseColor, BaseConfig } from "@config";
import { date2str, image_uri } from "@utils";
import React, { Component } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import Audio from "./messages/Audio";
import Contacts from "./messages/Contacts";
import File from "./messages/File";
import Image from "./messages/Image";
import Location from "./messages/Location";
import Reaction from "./messages/Reaction";
import ReplyReaction from "./messages/ReplyReaction";
import Story from "./messages/Story";
import Video from "./messages/Video";
import styles from "./styles";

const { CONTENTTYPE } = BaseConfig;

class MessageComponent extends Component {
    state = {
        width: 200,
    }
    renderAttach({ type, data }) {
        if (type == CONTENTTYPE.TEXT || type == CONTENTTYPE.FORWARD) return null;
        if (data && typeof data == 'string') {
            try {
                data = JSON.parse(data);
            } catch (err) {
            }
        }
        if (!data && type != CONTENTTYPE.STORY) return <Text style={{ padding: 10 }} headline bold>Attached file deleted</Text>
        switch (type) {
            case CONTENTTYPE.AUDIO:
                return this.renderAudio(data);
            case CONTENTTYPE.CONTACTS:
                return this.renderContacts(data);
            case CONTENTTYPE.FILE:
                return this.renderFile(data);
            case CONTENTTYPE.IMAGE:
                return this.renderImage(data);
            case CONTENTTYPE.LOCATION:
                return this.renderLocation(data);
            case CONTENTTYPE.VIDEO:
                return this.renderVideo(data);
            case CONTENTTYPE.STORY:
                return this.renderStory(data);
            case CONTENTTYPE.REACTION:
                return this.renderReaciton(data);
            case CONTENTTYPE.REPLY_REACTION:
                return this.renderReactionReply(data);
        }
    }

    async showStories(storyid, index) {
        if (this.props.isVisited) return;
        this.visiteMessage();
        const { stories: { mystory, visited_stories }, auth } = this.props;

        if (!mystory.gallery || mystory.gallery.length <= 0)
            return;

        const visited_story = visited_stories?.find(visited_story_item => visited_story_item.storyid == storyid) || {};
        this.props.onPreviewMessage();
        this.props.navigation.navigate("StoryView", { type: 1, stop: true, user: auth.user, storyid, visited_story, index });
    }
    renderStory(data) {
        const { message: { quoteid, etc, previewStory }, isVisited } = this.props;
        return <Story previewStory={previewStory} isVisited={isVisited} onPress={this.showStories.bind(this, quoteid, etc || 0)} />
    }
    renderAudio(data) {
        const { cur_playing_audio, onAudioPlay, message: { id }, isVisited } = this.props;
        return <Audio url={image_uri(data.url)?.uri} isPlaying={id == cur_playing_audio} isVisited={isVisited} onAudioPlay={onAudioPlay} onVisiteMessage={this.visiteMessage.bind(this)} />
    }
    renderContacts(data) {
        // id: res.id, avatar: res.avatar, name: res.name, phone: res.phone
        return <Contacts data={data} isVisited={this.props.isVisited} showToast={this.props.showToast} />
    }
    renderFile(data) {
        return <File data={data} showToast={this.props.showToast} isVisited={this.props.isVisited} onVisiteMessage={this.visiteMessage.bind(this)} />
    }
    renderImage({ url, preview }) {
        const { isVisited, app: { security } } = this.props;
        return <Image url={url} onLongPress={this.props.onLongPress} preview={preview}
            isVisited={isVisited}
            onVisiteMessage={this.visiteMessage.bind(this)}
            onpreview={(images, isgif) => {
                if (isVisited) return;
                this.visiteMessage();
                this.props.onPreviewMessage();
                this.props.navigation.navigate("PreviewImage", { images, security, isgif });
            }} />
    }
    visiteMessage() {
        const { onVisiteMessage } = this.props;
        onVisiteMessage?.();
    }
    pressMap(data) {
        if (this.props.isVisited) return;
        this.visiteMessage();
        this.props.onPreviewMessage();
        this.props.navigation.navigate("CustomMapView", { viewable: true, data })
    }
    renderLocation(data) {
        return <Location data={data} isVisited={this.props.isVisited} onLongPress={this.props.onLongPress} onPressMap={this.pressMap.bind(this, data)} />
    }
    renderVideo(data) {
        const { isVisited, app: { security } } = this.props;
        return <Video data={data}
            isVisited={isVisited}
            onpreview={() => {
                if (isVisited) return;
                this.visiteMessage();
                this.props.onPreviewMessage();
                this.props.navigation.navigate("VideoViewer", { ...image_uri(data.url, "url"), security });
            }} />
    }
    renderReaciton(data) {
        const { message: { id, sender, etc, roomid, answer, quoteid }, auth: { user: { id: myid } }, isVisited } = this.props;
        const answerable = (!answer?.id && sender != myid && (etc == 0 || etc == 2) && !(quoteid > 0));
        return <Reaction answerable={answerable} hidden={etc} attach={data}
            onPress={() => {
                if (isVisited) return;
                this.visiteMessage();
                this.props.onPressReaction({ ...data, id, sender, roomid, etc }, true);
            }}
            disabled={!this.props.onPressReaction}
            onLongPress={this.props.onLongPress}
            onCancel={() => this.props.reactionAnswer(id, etc)}
            mine={this.mine}
            isVisited={isVisited}
            onPreview={() => {
                if (isVisited) return;
                this.visiteMessage();
                let answer_attach = null;
                if (answer?.id > 0) { try { answer_attach = answer.attach; answer_attach = JSON.parse(answer_attach); } catch (error) { } }
                this.props.onPressReaction({ ...data, id, sender, roomid, etc }, false)
            }}
        />
    }
    renderReactionReply(data) {
        const { message: { replyReaction, type }, isVisited } = this.props;
        return (
            <ReplyReaction
                replyReaction={type == BaseConfig.CONTENTTYPE.FORWARD && !replyReaction ? this.replyReaction : replyReaction}
                attach={data}
                mine={this.mine}
                isVisited={isVisited}
                disabled={!this.props.onPressReaction}
                onPress={() => {
                    if (isVisited) return;
                    this.visiteMessage();
                    let answer_attach = null;
                    if (replyReaction?.id > 0) {
                        try {
                            answer_attach = replyReaction.attach;
                            answer_attach = JSON.parse(answer_attach);
                        } catch (error) {
                        }
                    }
                    this.props.onPressReaction(data, false);
                }}
                onLongPress={this.props.onLongPress}
            />
        )
    }
    getUserName(msg) {
        const { users: { users }, message: { roomid, sender } } = this.props;
        let sender_id = sender;
        if (msg?.roomid == roomid) {
            sender_id = msg?.sender;
        };
        const user = users.find(item => item.id == sender_id);
        return user?.name || 'User';
    }
    render() {
        const { message: { content, id, sender, created_at, attach, type, quote: msgquote }, sending, onQuotePress, disableLongPress, auth: { user: { id: myid } }, componentonly } = this.props;
        let { quote, onLongPress } = this.props;
        this.mine = (myid == sender) && !componentonly;
        if (type == BaseConfig.CONTENTTYPE.FORWARD) {
            quote = msgquote;
            if (quote?.type == BaseConfig.CONTENTTYPE.REPLY_REACTION) {
                this.replyReaction = quote.replyReaction;
            }
        }
        if (type == BaseConfig.CONTENTTYPE.REPLY_REACTION) {
            quote = null;
        }
        if (!content && !quote && !attach) return <></>;
        const ATTACHCOMPONNET = this.renderAttach({ data: attach, type });
        const quote_username = this.getUserName(quote);
        return (
            <View style={[styles.contain, this.mine && styles.flexend]}>
                <TouchableOpacity disabled={disableLongPress} onLongPress={onLongPress} style={[this.mine && styles.flexend, componentonly && { width: "100%" }]}>
                    <View style={[styles.message, this.mine && styles.myMessage, componentonly && { width: "100%", maxWidth: "100%" }]}>
                        {quote &&
                            <View style={styles.quote}>
                                <TouchableOpacity disabled={!onQuotePress} onPress={onQuotePress} style={{ overflow: "hidden" }}>
                                    {quote_username && <Text title style={{ margin: 5 }}>{quote_username}</Text>}
                                    {this.renderAttach({ type: quote.type, data: quote.attach })}
                                    {!!quote.content && <Text blackColor headline textParse style={{ lineHeight: 24 }}>{quote.content}</Text>}
                                    {!componentonly && <Text footnote grayColor style={styles.quote_time}>{date2str(quote?.created_at, 1) || ""}</Text>}
                                </TouchableOpacity>
                            </View>
                        }
                        <View>
                            <View style={{ marginVertical: ATTACHCOMPONNET ? 15 : 5 }}>
                                {ATTACHCOMPONNET}
                            </View>
                            <View style={styles.textcontent}>
                                {!!content && <Text headline textParse style={{ lineHeight: 24 }}>{content}</Text>}
                                {!componentonly &&
                                    <View style={[styles.flexend, { marginTop: 2, marginRight: -10 }]}>
                                        <Text footnote grayColor>{date2str(created_at, 1) || "Right now"}</Text>
                                    </View>}
                            </View>
                            {sending &&
                                <View style={styles.sending}>
                                    <ActivityIndicator color={BaseColor.whiteColor} size={'large'} />
                                </View>
                            }
                        </View>
                    </View>
                    {!componentonly && <View style={[styles.triangleCorner, this.mine && styles.rotate90]} />}
                </TouchableOpacity>
            </View>
        )
    }
}
const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(MessageComponent);
