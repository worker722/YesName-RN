import * as reduxActions from "@actions";
import { FriendItem, Header, Icon, Image, Text } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import { comparePhone, translate } from "@utils";
import React, { Component } from "react";
import { FlatList, ImageBackground, Platform, TextInput, TouchableOpacity, View } from "react-native";
import SendSMS from "react-native-sms";
import { connect } from "react-redux";
import styles from "./styles";
const { ApiActions, logger } = reduxActions;
const { INVITEPAGETYPE } = BaseConfig;

class InviteFriends extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected_users: [],
      selectedAll: false,
      search_word: null,
    }
    this.params = props.route?.params;
    this.PAGETYPE = this.params?.type || INVITEPAGETYPE.INVITE;
    this.visitInvite();
  }
  componentDidMount() {
    this.props.getContacts(true);
  }
  visitInvite() {
    ApiActions.updateUser(this.props.auth.user.id, { visit_invite: 1 })
      .then(res => {
        this.props.getMyInfo();
      })
      .catch(err => { })
  }
  skip() {
    this.props.navigation.navigate("Main");
  }
  inviteFriend() {
    const { selected_users } = this.state;
    if (!selected_users || selected_users.length <= 0) return;
    const { auth: { user } } = this.props;
    let invite_sms = global.config?.invite_sms || "Check out yesName! Your friend {sender name} invited you to an amazing new chat adventure!";
    const applink = Platform.OS == "android" ? global.config?.android_link : global.config?.ios_link;
    invite_sms = invite_sms
      .replace("{sender name}", user?.name || "")
      .replace("{sender phone}", user?.phone || "")
      .replace("{app link}", applink);
    let recipients = selected_users.map(item => item.phone ? (typeof item.phone == "string" ? item.phone : item.phone[0]?.number) : null)
      .filter(item => item);
    if (recipients.length <= 0) {
      this.props.showToast("You selected contact haven't phone number");
      return;
    }
    SendSMS.send({
      body: invite_sms,
      recipients,
      successTypes: ['sent'],
      allowAndroidSendWithoutReadPermission: true
    }, (completed, cancelled, error) => {
      this.setState({ selected_users: [] });
      if(this.PAGETYPE == INVITEPAGETYPE.INVITE){
        this.skip();
      }
    });
  }

  getChatRooms() {
    const { chat: { rooms, archived_room, joinusers } } = this.props;
    const checkArchive = (room) => {
      return room.type == BaseConfig.CALL.TEXT && archived_room?.some(roomid => room?.roomid == roomid) == false;
    }
    let data = rooms?.filter(checkArchive).slice(0, 5).map(room => {
      try {
        let room_users = joinusers.filter(item => item.roomid == room.roomid);
        return room_users[0].userid;
      } catch (error) {
      }
      return 0;
    });
    return data;
  }
  getData() {
    let data = [];
    try {
      const { users: { users, contacts } } = this.props;
      const { search_word } = this.state;

      data = contacts.map(item => {
        const contact_user = users?.find?.(v => comparePhone(item.phone, v.phone)) || {};

        const backgroundColor = item?.backgroundColor || colors[(Date.parse(new Date(contact_user.updated_at || contact_user.created_at)) % 3)];
        const avatar = item?.avatar || contact_user.avatar;
        const name = item?.name || contact_user.name;
        const phone = item?.phone || contact_user.phone;
        const id = contact_user?.id || `contacts_${item?.id || 0}`;

        return { ...contact_user, phone, id, backgroundColor, avatar, name, star: (Object.keys(contact_user).length > 0) };
      });
      if (search_word) {
        const search_key = search_word.trim().toLowerCase();
        data = data.filter(item => {
          let phone = '';
          let name = item?.name?.toLowerCase?.();
          if (typeof item.phone == "string") {
            phone = item?.phone;
          } else if (item?.phone?.length > 0) {
            phone = item.phone[0].number;
          }
          return name.includes?.(search_key) || phone.includes?.(search_key);
        });
      }
      data = data.filter(item => !comparePhone(item.phone, this.props.auth.user?.phone));
      data.sort((a, b) => a.name > b.name ? 1 : -1);
      if (this.PAGETYPE == INVITEPAGETYPE.INVITE || this.PAGETYPE == INVITEPAGETYPE.SELECTCONTACTS) {
      } else {
        let tops = this.getChatRooms();
        let top_users = data.filter(item => tops.some(v => v == item.id));
        data = data.filter(item => !tops.some(v => v == item.id));
        data = [...top_users, ...data];
      }
    } catch (err) {
      data = [];
    }
    return data;
  }
  pressItem(user) {
    if (this.PAGETYPE != INVITEPAGETYPE.SELECTCONTACTS && user.star == false) {
      const { selected_users } = this.state;
      const index = selected_users.findIndex(item => item.id == user.id);
      if (index >= 0) {
        selected_users.splice(index, 1);
      } else {
        selected_users.push(user);
      }
      this.setState({ selected_users });
      return;
    }
    if (this.PAGETYPE == INVITEPAGETYPE.CREATECHAT) {
      if (user.id) {
        global.chat_create_user = user.id;
        this.props.createChat(user.id);
        this.props.navigation.goBack();
      }
      return;
    } else if (this.PAGETYPE == INVITEPAGETYPE.SELECTCONTACTS) {
      let phone = '';
      try {
        if (typeof user.phone == "string") {
          phone = user.phone;
        } else if (typeof user.phone == "object" && user.phone.length > 0) {
          phone = user.phone[0].number;
        }
      } catch (error) {
      }
      let data = { id: user.id, avatar: user.avatar, name: user.name, phone }
      this.params?.callback(data);
      this.props.navigation.goBack();
      return;
    } else if (this.PAGETYPE == INVITEPAGETYPE.FORWARD || this.PAGETYPE == INVITEPAGETYPE.REACTION) {
      this.params?.callback(user.id);
      this.props.navigation.goBack();
      return;
    }
  }
  toggleSelectAll() {
    let selected_users = [];
    if (!this.checkSelectedAll()) {
      selected_users = this.getData();
    }
    this.setState({ selected_users });
  }
  checkSelectedAll() {
    const { selected_users } = this.state;
    try {
      if (selected_users.length <= 0) return false;
      return selected_users.length >= this.getData().length;
    } catch (err) {
      return false
    }
  }
  render() {
    const { app: { security } } = this.props;
    const { selected_users, search_word } = this.state;
    const selectedAll = this.checkSelectedAll();
    return (
      <View style={styles.container} forceInset={{ top: "always" }}>
        <Header
          leftBack={this.PAGETYPE != INVITEPAGETYPE.INVITE}
          onPressLeft={() => this.PAGETYPE != INVITEPAGETYPE.INVITE && this.props.navigation.goBack()}
          title={this.PAGETYPE == INVITEPAGETYPE.INVITE ? "Invite Friends" : "Choose friend"}
        />
        <View style={{ paddingHorizontal: 25, paddingTop: 20, width: "100%" }}>
          {this.PAGETYPE != INVITEPAGETYPE.SELECTCONTACTS &&
            <View style={[{ flexDirection: "row", paddingBottom: 15 }, styles.center]}>
              <TouchableOpacity onPress={this.toggleSelectAll.bind(this)} style={styles.select_all}>
                <Image noloading nopreview source={Images.ic_check[selectedAll ? "checked" : "unchecked"]} style={{ width: 35, height: 35 }} />
                <Text headline whiteColor> Select all</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={this.inviteFriend.bind(this)} activeOpacity={selected_users.length > 0 ? .8 : 1}>
                <ImageBackground
                  resizeMode={"stretch"}
                  source={selected_users.length > 0 ? Images.header_back : Images.gray_back}
                  style={[{ width: 100, height: 32, overflow: 'hidden', borderRadius: 14 }, styles.center]}
                >
                  <Text headline bold>{"Invite"}</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          }
          <View style={[styles.search_bar, styles.center]}>
            <TextInput
              value={search_word}
              onChangeText={search_word => this.setState({ search_word })}
              placeholder={translate("Search contacts")}
              style={{ flex: 1, padding: 4, fontSize: 17, paddingHorizontal: 10 }}
            />
            <Icon name={"search"} size={20} color={BaseColor.grayColor} />
          </View>
        </View>
        <FlatList
          style={{ width: "100%", marginVertical: 10 }}
          data={this.getData()}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <FriendItem
              user={item}
              markable={this.PAGETYPE != INVITEPAGETYPE.SELECTCONTACTS}
              selected={selected_users?.some(selected => selected.id === item.id)}
              onPress={() => this.pressItem(item)} />
          )}
        />
        {this.PAGETYPE == INVITEPAGETYPE.INVITE &&
          <View style={{ flexDirection: "row", paddingHorizontal: 30 }}>
            <TouchableOpacity style={styles.skip_button} onPress={this.skip.bind(this)}>
              <Text whiteColor title2 bold>{"Skip"}</Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    );
  }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = {
  ...reduxActions
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteFriends);
