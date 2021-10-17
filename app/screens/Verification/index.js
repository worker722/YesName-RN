import * as reduxActions from "@actions";
import { Image, Text } from "@components";
import { BaseColor, Images } from "@config";
import md5 from "md5";
import React, { Component } from "react";
import { Keyboard, TouchableOpacity, View } from "react-native";
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import { connect } from "react-redux";
import styles from "./styles";
const { ApiActions } = reduxActions;
class Verification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: "",
    }
  }
  componentDidMount() {
    this.props.destroyView();
  }
  onChangeCode(code) {
    this.setState({ code });
    if (code.length < 4) {
      return;
    }
    code = code.slice(0, 4);
    code = parseInt(code);
    Keyboard.dismiss();
    if (global.verify_code != md5(code)) {
      this.props.showToast("Wrong verification code");
      this.setState({ code: '' });
      return;
    }
    this.props.showLoading(true);
    const { user, navigation: { navigate } } = this.props;
    if (!user?.phone || !user?.device)
      return navigate("Loading");

    ApiActions.verification({ phone: user.phone, device: user.device, verify_code: code })
      .then(res => {
        this.props.getMyInfo();
        if (!user?.name) return navigate("InitProfile");
        if (user?.visit_intro != 1) return navigate("IntroductionVideo");
        if (user?.visit_invite != 1) return navigate("InviteFriends");
        return navigate("Main");
      })
      .catch(err => {
        this.props.showToast("Something went wrong")
      })
      .finally(() => {
        this.setState({ code: '' });
        this.props.destroyView();
      })
  }
  send_again() {
    this.props.showLoading(true);
    const { user } = this.props;
    if (!user?.phone)
      return this.props.navigation.navigate("Loading");
    ApiActions.send_verify_code({ phone: user.phone })
      .then(res => {
        if (res.code == 200) {
          global.verify_code = res.verify_code;
        }
      })
      .catch(err => {
        this.props.showToast("Something went wrong")
      })
      .finally(this.props.destroyView)
  }
  render() {
    const { code } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Image source={Images.logo} style={styles.logo} />
          <View style={{ marginVertical: 30 }}>
            <Text whiteColor header bold>{"Verification"}</Text>
            <Text whiteColor>Verification code 1234</Text>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <CodeField
            value={code}
            onChangeText={this.onChangeCode.bind(this)}
            cellCount={4}
            rootStyle={styles.codeFiledRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({ index, symbol, isFocused }) => (
              <Text
                key={index}
                whiteColor
                style={[
                  {
                    fontSize: 50,
                    width: 70,
                    height: 100,
                    textAlign: "center",
                    borderRadius: 30,
                    borderColor: BaseColor.whiteColor,
                    borderWidth: 3,
                    textAlignVertical: "center",
                    padding: 10,
                    paddingHorizontal: 15
                  },
                  isFocused && styles.focusCell]}
              >
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            )}
          />

          <TouchableOpacity
            style={[styles.send_again]}
            onPress={this.send_again.bind(this)}>
            <Text whiteColor headline bold>{"Send again"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({ user: state.auth.user })
const mapDispatchToProps = {
  ...reduxActions
}

export default connect(mapStateToProps, mapDispatchToProps)(Verification);
