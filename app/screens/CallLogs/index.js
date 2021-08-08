import * as reduxActions from "@actions";
import { CallLogItem, ConfirmCall, Header } from "@components";
import { BaseConfig } from "@config";
import { compareDate } from "@utils";
import React, { Component } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
const { CALL } = BaseConfig;

class CallLogs extends Component {
  state = {
    visibleConfirmCall: false,
    loading: false
  }
  constructor(props) {
    super(props);
    this.onGoBack = this.onGoBack.bind(this);
  }
  componentDidMount() {
    this.focusListener = this.props.navigation.addListener("focus", () => {
      this.onRefresh();
      this.timer = setInterval(() => {
        this.props.getMissedCalls(true);
      }, 10000);
    });
    this.blurListener = this.props.navigation.addListener("blur", () => {
      clearInterval(this.timer);
    });
  }
  componentWillUnmount() {
    try {
      this.focusListener.remove();
      this.blurListener.remove();
    } catch (err) { }
  }
  onRefresh() {
    this.props.getMissedCalls(true);
    this.props.getChatRoom();
    this.props.getChatList();
  }
  onGoBack() {
    this.props.navigation.goBack();
  }
  get getCallLogs() {
    const { chat: { rooms, joinusers }, users: { users } } = this.props;
    let data = rooms.filter(room => (room.type == CALL.VIDEO || room.type == CALL.VOICE) && !room.security);
    const getUser = (room) => {
      let user = {};
      try {
        let roomuser = joinusers.find(item => item.roomid == room.roomid);
        user = users?.find(item => item.id == (roomuser?.userid));
      } catch (error) {
      }
      return { ...room, user };
    }
    data = data.map(item => getUser(item));
    data = data.sort((a, b) => compareDate(a.created_at, b.created_at, false))
    return data;
  }
  onPressLogs({ user: callUser }) {
    this.callUser = callUser;
    this.setState({ visibleConfirmCall: true });
  }
  renderLogs({ item, index }) {
    if (!item?.user) return <></>;
    return <CallLogItem data={item} onPress={this.onPressLogs.bind(this, item)} />
  }
  onConfirmCall(type) {
    this.onCancelCall();
    const userid = this.callUser.id;
    if (!userid || !type) return;
    const data = { userid, state: BaseConfig.CALLINGSTATE.INCOMING, type };
    this.props.navigation.navigate("InOutCalling", { data })
  }
  onCancelCall() {
    this.setState({ visibleConfirmCall: false });
  }
  render() {
    const { visibleConfirmCall, loading } = this.state;
    return (
      <View style={styles.container}>
        <Header title={"Call Logs"} />
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={this.onRefresh.bind(this)} />
          }
          style={{ flex: 1, width: "100%" }}
          data={this.getCallLogs}
          keyExtractor={(_, index) => index.toString()}
          renderItem={this.renderLogs.bind(this)}
        />
        <ConfirmCall
          visible={visibleConfirmCall}
          user={this.callUser}
          onConfirm={this.onConfirmCall.bind(this)}
          onCancel={this.onCancelCall.bind(this)}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(CallLogs);
