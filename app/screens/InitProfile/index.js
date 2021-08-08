import * as reduxActions from "@actions";
import { Avatar, Text } from "@components";
import { BaseColor, BaseConfig } from "@config";
import { translate } from "@utils";
import React, { Component } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import ImagePicker from 'react-native-image-crop-picker';
import { connect } from "react-redux";
import styles from "./styles";

const { ApiActions } = reduxActions;

class InitProfile extends Component {
  constructor(props) {
    super(props);
    const user = props.auth?.user || {};
    this.state = {
      name: user.name,
      avatar: user.avatar,
      state: user.n_state,
      choose_image: null
    }
  }
  selectImage = (isCamera) => {
    const options = {
      cropping: true,
    };
    const response = (image) => {
      const choose_image = {
        type: image.mime || "image/png",
        name: `${new Date().getTime()}.${image?.mime?.split("/")[1] || "avatar.png"}`,
        uri: image.path
      };
      this.setState({ choose_image });
    }
    if (isCamera) {
      ImagePicker.openCamera(options).then(response);
    } else {
      ImagePicker.openPicker(options).then(response);
    }
  };
  async saveProfile() {
    try {
      const { choose_image, name, avatar } = this.state;
      if (!name) {
        return this.props.showToast("Enter your name");
      }
      this.props.showLoading(true);
      let user_avatar = avatar;
      if (choose_image) {
        const res = await this.props.uploadFile2Server(choose_image, BaseConfig.UPLOADTYPE.PROFILE);
        if (res.success) {
          user_avatar = res.path;
        }
      }
      const { auth: { user }, navigation: { navigate } } = this.props;
      const update_res = await ApiActions.updateProfile({ avatar: user_avatar, name });
      if (update_res.success) {
        this.props.getMyInfo();
        if (user?.visit_intro != 1) return navigate("IntroductionVideo");
        if (user?.visit_invite != 1) return navigate("InviteFriends");
        return navigate("Main");
      } else {
        throw new Error(update_res?.message || "Server error");
      }
    } catch (err) {
      this.props.showToast("Something went wrong")
    }
    this.props.destroyView();
  }
  render() {
    const { name, avatar, choose_image } = this.state;
    return (
      <View style={styles.container}>
        <Avatar avatar={choose_image || avatar} defavatar size={"large"} onPress={this.selectImage.bind(this)} />
        <TextInput
          style={styles.name_input}
          placeholderTextColor={BaseColor.whiteColor}
          placeholder={translate("Name")}
          onChangeText={name => this.setState({ name })}
          value={name}
        />
        <TouchableOpacity style={styles.form_button} onPress={this.saveProfile.bind(this)}>
          <Text whiteColor title3>{"Save"}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = {
  ...reduxActions
}

export default connect(mapStateToProps, mapDispatchToProps)(InitProfile);
