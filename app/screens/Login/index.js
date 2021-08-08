import * as reduxActions from "@actions";
import { Image, ModalPickerImage, Text } from "@components";
import { BaseConfig, Images } from "@config";
import { checkString, translate } from "@utils";
import React, { Component } from "react";
import { ImageBackground, TouchableOpacity, View } from "react-native";
import PhoneInput from 'react-native-phone-input';
import { connect } from "react-redux";
import styles from "./styles";
const { ApiActions } = reduxActions;

class Login extends Component {
  state = {
    pickerData: []
  }
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.destroyView();
    this.setState({
      pickerData: this.phoneRef.getPickerData()
    })
  }
  login() {
    if (!this.phoneRef.isValidNumber()) {
      this.phoneRef.focus();
      return;
    };
    this.props.showLoading(true);
    this.phoneRef.blur();
    const phone = this.phoneRef.getValue();
    const device = global.device;
    ApiActions.login({ phone, device })
      .then(res => {
        if (res.code == 200) {
          this.props.getMyInfo();
          if (res.success) {
            if (!checkString(res.user?.name)) return navigate("InitProfile");
            if (res.user?.visit_intro != 1) return navigate("IntroductionVideo");
            if (res.user?.visit_invite != 1) return navigate("InviteFriends");
            return navigate("Main");
          } else {
            global.verify_code = res.verify_code;
            return this.props.navigation.navigate("Verification");
          }
        } else {
          this.props.showToast(res.message || "Something went wrong");
        }
      })
      .catch(err => {
        this.props.showToast("Something went wrong");
      })
      .finally(() => this.props.showLoading(false));
  }
  onPressFlag() {
    this.myCountryPicker.open()
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Image noloading nopreview source={Images.logo} style={styles.logo} />
          <View style={{ marginVertical: 30 }}>
            <Text whiteColor header bold>login</Text>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <PhoneInput
            ref={ref => this.phoneRef = ref}
            initialCountry={'ch'}
            textProps={{ placeholder: translate("Input your phone number") }}
            style={styles.phone}
            flagStyle={{ width: 32, height: 25 }}
            textStyle={styles.phone_text}
            value={''}
            onPressFlag={this.onPressFlag.bind(this)}
          />
          <ModalPickerImage
            ref={(ref) => { this.myCountryPicker = ref; }}
            data={this.state.pickerData}
            onChange={(country) => { this.phoneRef.selectCountry(country.iso2) }}
            cancelText={translate('Cancel')}
          />
          <TouchableOpacity
            style={[styles.btn_login]}
            onPress={this.login.bind(this)}>
            <ImageBackground source={Images.header_back} resizeMode={'stretch'} style={styles.btn_login}>
              <Text whiteColor title2 bold>LOGIN</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = {
  ...reduxActions
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
