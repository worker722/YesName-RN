import * as reduxActions from "@actions";
import { ChatItem, Icon, Text } from "@components";
import { BaseColor } from "@config";
import React, { Component } from "react";
import { RefreshControl, TouchableOpacity, View } from "react-native";
import { SwipeListView } from 'react-native-swipe-list-view';
import { connect } from "react-redux";

class BlockContacts extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.getChatRoom();
    this.props.getBlockList();
    this.props.getChatList();
  }
  restore({ index, item }) {
    const { isBlockContacts } = this.props;
    if (isBlockContacts) {
      this.props.blockRoom(item.roomid, false);
    } else {
      this.props.archiveRoom(item.roomid, false);
    }
  }
  deleteList({ index, item }) {
    this.props.showAlert({
      title: "Confirm",
      message: "Do you really want to delete this chat?",
      textConfirm: "Yes",
      textCancel: "No",
      visible: true,
      onConfirm: () => {
        this.props.deleteRoom(item.roomid);
      },
    })
  }
  renderHiddenItem(data, rowMap) {
    const { isBlockContacts } = this.props;
    const closeRow = () => {
      try {
        rowMap[data.item.roomid].closeRow();
      } catch (error) {
      }
    }
    return (
      <View style={{ flex: 1, alignItems: "flex-end", justifyContent: "center", paddingRight: 10 }}>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => {
            closeRow();
            this.restore(data);
          }} style={{ padding: 10 }}>
            <Icon color={BaseColor.whiteColor} name={"backup"} size={24} type={'MaterialIcons'} />
          </TouchableOpacity>
          {!isBlockContacts &&
            <View style={[{ width: 40, justifyContent: "center", alignItems: "center" }]}>
              <TouchableOpacity onPress={() => {
                closeRow();
                this.deleteList(data)
              }} >
                <Icon color={BaseColor.whiteColor} name={"trash-alt"} size={20} />
              </TouchableOpacity>
            </View>
          }
        </View>
      </View >
    )
  };
  get dataList() {
    const { isBlockContacts, chat: { rooms, archived_room, blocked_users } } = this.props;
    if (isBlockContacts) return blocked_users || [];
    const checkArchive = (room) => archived_room?.some(roomid => room?.roomid == roomid)
    let data = rooms?.filter(checkArchive);
    return data || [];
  }
  render() {
    return (
      <SwipeListView
        data={this.dataList}
        style={{ width: "100%", marginTop: 10 }}
        keyExtractor={(item, index) => item.roomid}
        refreshControl={
          <RefreshControl
            colors={[BaseColor.primaryColor]}
            refreshing={false}
            onRefresh={this.componentDidMount.bind(this)} />
        }
        renderItem={({ item, index }) => {
          return (
            <View style={{ backgroundColor: BaseColor.primaryColor }}>
              <ChatItem onPress={() => { }} room={item} />
            </View>
          );
        }}
        renderHiddenItem={this.renderHiddenItem.bind(this)}
        rightOpenValue={-140}
      />
    );
  }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(BlockContacts);
