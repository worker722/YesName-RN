import * as reduxActions from "@actions";
import { Badge, BubbleImage, ChatItem, Header, Icon } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import React, { Component } from "react";
import { Image, RefreshControl, TouchableOpacity, View } from "react-native";
import { SwipeListView } from 'react-native-swipe-list-view';
import { connect } from "react-redux";
import { CubeNavigationHorizontal, CubeNavigationVertical } from "react-native-3dcube-navigation";
import styles from "./styles";
const { MUTE_KEY } = BaseConfig;
const ROOM_ACTIONS = {
  ARCHIVE: 0,
  BLOCK: 1,
  DELETE: 2,
  RESTORE: 3,
  BLOCKRESTORE: 4,
  MUTE: 5,
  MUTERESTORE: 6,
};
const ROOM_VIEWTYPE = {
  CHATROOMS: 0,
  ARCHIVED: 1,
  BLOCKED: 2,
}
class ChatHome extends Component {
  state = {
    showing_type: ROOM_VIEWTYPE.CHATROOMS
  }
  constructor(props) {
    super(props);
    this.onGoBack = this.onGoBack.bind(this);
  }
  componentDidMount() {
    this.focusListener = this.props.navigation.addListener("focus", () => {
      const { app: { security } } = this.props;
      if (security) {
        this.props.changeSecurityBar(true);
      }
      this.onRefresh();
    });
    this.blurListener = this.props.navigation.addListener("blur", () => {
      this.props.changeSecurityBar(false);
    });
    const { app: { security } } = this.props;
    if (security) {
      this.modalScroll.scrollTo(1, false);
    }
  }
  componentDidUpdate(preProps, state) {
    const { app: { security: preSecurity } } = preProps;
    const { app: { security, securityBar } } = this.props;
    if (preSecurity != security && !this.updateLocal) {
      this.modalScroll.scrollTo(security ? 1 : 0, false);
      if (security != securityBar) {
        this.props.changeSecurityBar(security);
      }
    }
    this.updateLocal = false;
  }
  onRefresh() {
    this.props.getChatRoom();
    this.props.getBlockList();
    this.props.getChatList();
  }
  componentWillUnmount() {
    try {
      this.focusListener.remove();
      this.blurListener.remove();
    } catch (err) {
    }
  }
  onGoBack() {
    this.props.navigation.goBack();
  }
  onGoContacts() {
    this.props.navigation.navigate("InviteFriends", { type: BaseConfig.INVITEPAGETYPE.CREATECHAT });
  }
  openChat({ roomid }) {
    const { showing_type } = this.state;
    if (showing_type == ROOM_VIEWTYPE.BLOCKED)
      return;
    this.props.navigation.navigate("Chat", { roomid });
  }
  roomactionConfirm(type, item) {
    if (type == ROOM_ACTIONS.ARCHIVE || type == ROOM_ACTIONS.RESTORE) {
      this.props.archiveRoom(item.roomid, type == ROOM_ACTIONS.ARCHIVE);
    } else if (type == ROOM_ACTIONS.DELETE) {
      this.props.deleteRoom(item.roomid);
    } else if (type == ROOM_ACTIONS.BLOCK || type == ROOM_ACTIONS.BLOCKRESTORE) {
      this.props.blockRoom(item.roomid, type == ROOM_ACTIONS.BLOCK);
    } else if (type == ROOM_ACTIONS.MUTE || type == ROOM_ACTIONS.MUTERESTORE) {
      this.props.muteRoom(item.roomid, type == ROOM_ACTIONS.MUTE ? MUTE_KEY : "");
    }
  }
  roomActions(type, { index, item }) {
    if (type == ROOM_ACTIONS.DELETE || type == ROOM_ACTIONS.BLOCK) {
      this.props.showAlert({
        title: "Confirm",
        message:
          type == ROOM_ACTIONS.DELETE ?
            "Do you really want to delete this chat?" :
            "Do you really want to block this chat?",
        textConfirm: "Yes",
        textCancel: "No",
        visible: true,
        onConfirm: () => {
          this.roomactionConfirm(type, item);
        },
      })
    } else {
      this.roomactionConfirm(type, item);
    }
  }
  renderHiddenItem(data, rowMap) {
    const { showing_type } = this.state;
    const closeRow = () => {
      try {
        rowMap[data.item.roomid].closeRow();
      } catch (error) {
      }
    }
    const isMute = (data.item.mute == MUTE_KEY);
    return (
      <View style={styles.rowBack}>
        <View style={[{ flex: 1 }, styles.center]} />
        {showing_type == ROOM_VIEWTYPE.ARCHIVED ?
          <View style={[{ width: 40 }, styles.center]}>
            <TouchableOpacity onPress={() => {
              closeRow();
              this.roomActions(ROOM_ACTIONS.RESTORE, data);
            }}>
              <Icon color={BaseColor.whiteColor} name={"undo"} size={20} />
            </TouchableOpacity>
          </View>
          :
          showing_type == ROOM_VIEWTYPE.BLOCKED ?
            <View style={[{ width: 40 }, styles.center]}>
              <TouchableOpacity onPress={() => {
                closeRow();
                this.roomActions(ROOM_ACTIONS.BLOCKRESTORE, data);
              }} >
                <Icon color={BaseColor.whiteColor} name={"undo"} size={20} />
              </TouchableOpacity>
            </View>
            :
            <>
              <View style={[{ width: 40 }, styles.center]}>
                <TouchableOpacity onPress={() => {
                  closeRow();
                  this.roomActions(isMute ? ROOM_ACTIONS.MUTERESTORE : ROOM_ACTIONS.MUTE, data);
                }} >
                  <Icon color={BaseColor.whiteColor} name={isMute ? "microphone-alt" : "microphone-alt-slash"} size={20} />
                </TouchableOpacity>
              </View>
              <View style={[{ width: 40 }, styles.center]}>
                <TouchableOpacity onPress={() => {
                  closeRow();
                  this.roomActions(ROOM_ACTIONS.ARCHIVE, data);
                }} >
                  <Icon color={BaseColor.whiteColor} name={"archive"} size={24} type={"MaterialIcons"} />
                </TouchableOpacity>
              </View>
              <View style={[{ width: 40 }, styles.center]}>
                <TouchableOpacity onPress={() => {
                  closeRow();
                  this.roomActions(ROOM_ACTIONS.BLOCK, data);
                }} >
                  <Icon color={BaseColor.whiteColor} name={"ban"} size={20} />
                </TouchableOpacity>
              </View>
            </>
        }
        {showing_type != ROOM_VIEWTYPE.BLOCKED &&
          <View style={[{ width: 40 }, styles.center]}>
            <TouchableOpacity onPress={() => {
              closeRow();
              this.roomActions(ROOM_ACTIONS.DELETE, data)
            }} >
              <Icon color={BaseColor.whiteColor} name={"trash-alt"} size={20} />
            </TouchableOpacity>
          </View>
        }
      </View >
    )
  };
  getChatRooms(security) {
    const { chat: { rooms, archived_room, blocked_users } } = this.props;
    const { showing_type } = this.state;
    const is_archive = (showing_type == ROOM_VIEWTYPE.ARCHIVED);
    const checkArchive = (room) => {
      return room.type == BaseConfig.CALL.TEXT && archived_room?.some(roomid => room?.roomid == roomid) == is_archive;
    }
    let data = rooms?.filter(checkArchive);
    data = data?.filter(item => item.security == security);
    if (showing_type == ROOM_VIEWTYPE.BLOCKED) {
      data = blocked_users;
    }
    return data;
  }
  renderSecurityIcon(security) {
    const { chat: { normal_unread, security_unread } } = this.props;
    return (
      <>
        <BubbleImage source={security ? Images.ic_chat : Images.ic_security} size={25} disable />
        <Badge
          color={BaseColor.redColor}
          value={security ? normal_unread : security_unread}
          size={20}
          topRight
        />
      </>
    )
  }
  onScrollChange(offset, index) {
    const { app: { security } } = this.props;
    if (security && offset == 0) {
      this.props.changeSecurity(!security);
    } else if (!security && offset != 0) {
      this.props.changeSecurity(!security);
    }
  }
  onChagneCube(security) {
    this.updateLocal = true;
    this.modalScroll.scrollTo(security ? 0 : 1, true);
    this.props.changeSecurity(!security);
    this.props.changeSecurityBar(!security);
  }
  renderChatList(index) {
    const security = index == 1;
    const { app: { securityBar } } = this.props
    return (
      <View style={styles.container} key={index}>
        <Header
          title={"Chats"}
          renderLeft={<BubbleImage source={Images.edit} size={22} disable />}
          onPressLeft={this.onGoContacts.bind(this)}
          renderRight={this.renderSecurityIcon(security)}
          OnPressRight={this.onChagneCube.bind(this, security)}
          security={securityBar}
        />
        {security && this.getChatRooms(security).length == 0 ?
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", width: "60%", }}>
            <Image source={Images.ic_gray_security} style={{ width: "65%", opacity: .2, borderRadius: 200 }} resizeMode={'contain'} />
          </View>
          :
          <SwipeListView
            data={this.getChatRooms(security)}
            style={{ width: "100%", marginTop: 10 }}
            keyExtractor={(item, index) => item.roomid}
            disableRightSwipe
            refreshControl={
              <RefreshControl
                colors={[BaseColor.primaryColor]}
                refreshing={false}
                onRefresh={this.onRefresh.bind(this)} />
            }
            renderItem={({ item, index }) => {
              return (
                <View style={{ backgroundColor: BaseColor.primaryColor }}>
                  <ChatItem onPress={() => this.openChat(item)} room={item} />
                </View>
              );
            }}
            renderHiddenItem={this.renderHiddenItem.bind(this)}
            rightOpenValue={-170}
          />
        }
      </View>
    );
  }
  render() {
    return (
      <CubeNavigationHorizontal
        callBackAfterSwipe={(g) => this.onScrollChange(g)}
        ref={(ref) => this.modalScroll = ref}
        disableSwipe={true}
      >
        {this.renderChatList(0)}
        {this.renderChatList(1)}
      </CubeNavigationHorizontal>
    );
  }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(ChatHome);
