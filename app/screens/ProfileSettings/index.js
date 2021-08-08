import * as reduxActions from "@actions";
import { BlockContacts, Icon, ModalPickerImage, Profile1, Text } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import { translate } from "@utils";
import md5 from "md5";
import React, { Component } from "react";
import { BackHandler, Image, ImageBackground, Keyboard, ScrollView, TouchableOpacity, View, Linking } from "react-native";
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import { Input } from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import PhoneInput from 'react-native-phone-input';
import { connect } from "react-redux";
import styles from "./styles";
import RNFS from 'react-native-fs';

const { ApiActions, logger } = reduxActions;

const _SETTING_ITEMS = [
  { id: 0, image: Images.call_white, icon: "phone-alt", title: "Change Number" },
  // { id: 1, image: Images.audio_white, icon: "volume-up", title: "Sound Control" },
  { id: 4, icon: "book-open", title: "Terms and conditions" },
  { id: 5, icon: "copyright", title: "Version" },
  // { id: 2, icon: "cog", title: "Settings" },
  { id: 6, icon: "archive", title: "Archived accounts", type: 'MaterialIcons' },
  { id: 3, image: Images.block2, icon: "ban", title: "Blocked accounts" },
  { id: 7, icon: "blogger", title: "Log report", type: "FontAwesome5Brands" },
]
const _PERSON_SETTING_ITEMS = [
  { id: 101, icon: "calendar-alt", title: "Availability", subtitle: "Busy" },
  { id: 102, icon: "calendar-alt", title: "Birthday", subtitle: "20.11.2020" },
  { id: 103, icon: "globe", title: "Language" },
]
const EDIT_TYPE = {
  DEFAULT: "DEFAULT",
  CHANGE_NAME: "CHANGE_NAME",
  CHANGE_PICTURE: "CHANGE_PICTURE",
  CHANGE_PHONE: "CHANGE_PHONE",
  VERIFY_PHONE: "VERIFY_PHONE",
  CHANGE_STATE: "CHANGE_STATE",
  SOUNDCONTROL: "SOUNDCONTROL",
  SETTINGS: "SETTINGS",
  BLOCKCONTACTS: "BLOCKCONTACTS",
  TERMSCONDITIONS: "TERMSCONDITIONS",
  VERISON: "VERISON",
  ARCHIVECONTACTS: "ARCHIVECONTACTS",
  LANGUAGE: "LANGUAGE",
}
class ProfileSettings extends Component {
  state = {
    edit: {
      visible: false,
      type: EDIT_TYPE.DEFAULT,
      name: null
    },
    pickerData: null
  }
  constructor(props) {
    super(props);
    this.onGoBack = this.onGoBack.bind(this);
  }
  componentDidMount() {
    this.props.getUserStates();

    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!this.state?.edit?.type || this.state?.edit?.type == EDIT_TYPE.DEFAULT) {
        return false;
      } else {
        this.setEdit({ type: EDIT_TYPE.DEFAULT });
        return true;
      }
    });
  }
  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress");
    this.backHandler?.remove();
    this.backHandler = null;
  }
  componentDidUpdate() {
    if (this.phoneRef && !this.state.pickerData) {
      this.setState({ pickerData: this.phoneRef.getPickerData() })
    }
  }
  onGoBack() {
    if (!this.state?.edit?.type || this.state?.edit?.type == EDIT_TYPE.DEFAULT) {
      this.props.navigation.goBack();
    } else {
      this.setEdit({ type: EDIT_TYPE.DEFAULT });
    }
  }
  onPressAction(type) {
    switch (type) {
      case 0:
        this.touchToEdit(EDIT_TYPE.CHANGE_PHONE);
        return;
      case 1:
        this.setEdit({ type: EDIT_TYPE.SOUNDCONTROL });
        return;
      case 2:
        this.setEdit({ type: EDIT_TYPE.SETTINGS });
        return;
      case 3:
        this.setEdit({ type: EDIT_TYPE.BLOCKCONTACTS });
        return;
      case 4:
        // this.setEdit({ type: EDIT_TYPE.TERMSCONDITIONS });
        const link = global.config?.terms_url;
        if (link) {
          Linking.canOpenURL(link).then(res => {
            if (res) {
              Linking.openURL(link);
            }
          })
        }
        return;
      case 5:
        this.setEdit({ type: EDIT_TYPE.VERISON });
        return;
      case 6:
        this.setEdit({ type: EDIT_TYPE.ARCHIVECONTACTS });
        return;
      case 7:
        this.reportlog();
        return;
      case 101:
        return;
      case 102:
        return;
      case 103:
        this.setEdit({ type: EDIT_TYPE.LANGUAGE });
        return;
      default:
        break;
    }
  }
  async reportlog() {
    try {
      this.props.showLoading(true, "Reporting...");
      let files = await RNFS.readdir(global.log_path);
      files = files.map(item => ({
        name: item,
        type: "text/plain",
        uri: `file://${global.log_path}/${item}`
      }));
      const type = `${BaseConfig.UPLOADTYPE.LOGGER}_${this.props.auth.user.id}`;

      const res = await Promise.all(files.map(async item => await this.props.uploadFile2Server(item, type)));
      logger.log(res);
    } catch (error) {
      logger.error(error);
    }
    this.props.showLoading(false);
    this.props.showToast("Thanks for you reporting!");
  }
  renderSettingItem({ icon, title, image, id, subtitle, type }) {
    return (
      <TouchableOpacity
        key={id}
        onLayout={(event) => id == 0 && this.measureView(event, EDIT_TYPE.CHANGE_PHONE)}
        onPress={this.onPressAction.bind(this, id)}
        style={[styles.setting_item, styles.center]}>
        <ImageBackground
          resizeMode={"stretch"}
          source={Images.ic_back.active}
          style={[styles.setting_item_icon, styles.center]}>
          {image ?
            <Image source={image} style={{ width: 20, height: 20 }} />
            :
            <Icon name={icon} color={BaseColor.whiteColor} size={18} type={type} />
          }
        </ImageBackground>
        <View style={styles.setting_item_title}>
          <Text whiteColor title3>{title}</Text>
          {subtitle && <Text whiteColor headline style={{ marginTop: 4, marginLeft: 5 }}>{subtitle}</Text>}
        </View>
        <ImageBackground
          resizeMode={"stretch"}
          source={Images.header_back}
          style={[styles.setting_item_arrow, styles.center]}>
          <Icon name={"angle-right"} color={BaseColor.primaryColor} size={18} />
        </ImageBackground>
      </TouchableOpacity>
    )
  }
  onConfirmChange(type) {
    let data = {};
    const { edit } = this.state;
    if (type == EDIT_TYPE.CHANGE_NAME) {
      if (!edit.name) return this.props.showToast("Please input your name")
      data = {
        name: edit.name
      }
    } else if (type == EDIT_TYPE.CHANGE_PHONE) {
      if (!this.phoneRef.isValidNumber()) {
        this.props.showToast("Please input valid phone number")
        this.phoneRef.focus();
        return;
      };
      this.phoneRef.blur();
      const phone = this.phoneRef.getValue();
      this.setEdit({ phone, type: EDIT_TYPE.VERIFY_PHONE }, () => {
        this.sendVerifyCode(phone);
      });
      return;
    } else if (type == EDIT_TYPE.CHANGE_STATE) {
      if (!edit.selected) return;
      data = {
        n_state: edit.selected
      }
    }
    this.updateProfile(data);
  }
  updateProfile(data) {
    this.props.showLoading(true);
    this.setState({ edit: { visible: false } });
    ApiActions.updateProfile(data)
      .then(res => {
        this.props.getMyInfo();
        this.props.showToast("Successfully changed");
      })
      .catch(err => this.props.showToast(err?.message || `Something went wrong`))
      .finally(() => this.props.showLoading(false));
  }
  setEdit(item, callback) {
    this.setState({
      edit: {
        ...this.state.edit,
        ...item
      }
    }, () => {
      callback && callback();
    })
  }
  measureView({ nativeEvent: { layout } }, type) {
    this.setState({ [type]: layout });
  }
  selectImage = (isCamera) => {
    const options = {
      cropping: true,
    };

    const response = async (image) => {
      this.props.showLoading(true);

      const choose_image = {
        type: image.mime || "image/png",
        name: `${new Date().getTime()}.${image?.mime?.split("/")[1] || "avatar.png"}`,
        uri: image.path
      };
      const res = await this.props.uploadFile2Server(choose_image, BaseConfig.UPLOADTYPE.PROFILE);

      if (res.success) {
        this.updateProfile({ avatar: res.path });
      } else {
        this.props.showToast("profile-upload-failed")
        this.props.showLoading(false);
      }
    }
    ImagePicker[isCamera ? 'openCamera' : 'openPicker'](options)
      .then(response)
      .catch(err => this.props.showLoading(false));
  };
  onPressFlag() {
    this.myCountryPicker.open()
  }
  changeState(id) {
    this.updateProfile({ n_state: id });
  }
  sendVerifyCode() {
    this.props.showLoading(true);
    const { edit: { phone } } = this.state;
    if (!phone) return;
    ApiActions.send_verify_code({ phone })
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
  renderEditView() {
    const {
      edit: { visible, type, name, phone, selected, verify_code },
      [type == EDIT_TYPE.VERIFY_PHONE ? EDIT_TYPE.CHANGE_PHONE : type]: layout,
      ["SCROLLVIEW"]: scrollview_layout
    } = this.state;
    if (!visible) return null;
    let style = {
      top: (layout.y + layout.height + 15)
    };
    const _CHANGEPROFILE = type == EDIT_TYPE.CHANGE_PICTURE;
    const _CHANGESTATE = type == EDIT_TYPE.CHANGE_STATE;
    const _CHANGENAME = type == EDIT_TYPE.CHANGE_NAME;
    const _CHANGEPHONE = type == EDIT_TYPE.CHANGE_PHONE;
    const _VERIFYPHONE = type == EDIT_TYPE.VERIFY_PHONE;

    let title = "Change Name";

    if (_CHANGEPHONE || _VERIFYPHONE) {
      title = _CHANGEPHONE ? "New Number" : "Verify Code"
      style = { top: style.top + scrollview_layout.y + 30 };
    } else if (_CHANGEPROFILE) {
      title = "Change profile picture";
      style = { top: style.top + 20, width: "80%", marginLeft: "10%" };
    } else if (_CHANGESTATE) {
      title = null;
    }

    const { auth: { user }, users: { userState } } = this.props;
    return (
      <ImageBackground source={Images.header_back} resizeMode={"stretch"} style={[styles.edit_dlg, styles.center, style]}>
        {!_CHANGEPROFILE && !_CHANGESTATE &&
          <ImageBackground
            resizeMode={"stretch"} source={Images.ic_back.active} style={[styles.setting_item_icon, styles.center]}>
            <Icon name={"edit"} color={BaseColor.primaryColor} size={18} />
          </ImageBackground>
        }
        <View style={{ flex: 1, paddingVertical: 8, paddingLeft: 10 }}>
          {!!title && <Text primaryColor headline style={styles.setting_item_title}>{title}</Text>}
          {_CHANGENAME ?
            <Input
              onChangeText={(name) => this.setEdit({ name })}
              value={name}
              placeholder={translate('Name')}
              style={{ color: BaseColor.primaryColor, fontSize: 18 }}
              inputContainerStyle={{ borderBottomColor: BaseColor.primary3Color, height: 40 }}
              placeholderTextColor={BaseColor.primary3Color}
            />
            :
            _CHANGEPROFILE ?
              <>
                <TouchableOpacity style={[styles.change_profile, styles.center]} onPress={this.selectImage.bind(this, false)}>
                  <ImageBackground
                    resizeMode={"stretch"} source={Images.ic_back.active} style={[styles.gallery_item_icon, styles.center]}>
                    <Icon name={"image"} color={BaseColor.primaryColor} size={18} />
                  </ImageBackground>
                  <Text primaryColor headline style={{ flex: 1, marginLeft: 6 }}>{"Choose one from gallery"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.change_profile, styles.center]} onPress={this.selectImage.bind(this, true)}>
                  <ImageBackground
                    resizeMode={"stretch"} source={Images.ic_back.active} style={[styles.gallery_item_icon, styles.center]}>
                    <Icon name={"camera"} color={BaseColor.primaryColor} size={18} />
                  </ImageBackground>
                  <Text primaryColor headline style={{ flex: 1, marginLeft: 6 }}>{"Open Camera"}</Text>
                </TouchableOpacity>
              </>
              :
              _CHANGEPHONE ?
                <PhoneInput
                  ref={ref => this.phoneRef = ref}
                  initialCountry={'ch'}
                  textProps={{ placeholder: translate("Input your phone number") }}
                  flagStyle={{ width: 32, height: 30 }}
                  textStyle={styles.phone_text}
                  value={phone}
                  onPressFlag={this.onPressFlag.bind(this)}
                />
                :
                _VERIFYPHONE
                  ?
                  <CodeField
                    value={verify_code}
                    onChangeText={this.onChangeCode.bind(this)}
                    cellCount={4}
                    rootStyle={{
                      alignItems: "center",
                      justifyContent: "center",
                      marginVertical: 10
                    }}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    renderCell={({ index, symbol, isFocused }) => (
                      <Text
                        key={index}
                        whiteColor
                        style={[
                          {
                            fontSize: 20,
                            width: 40,
                            height: 50,
                            textAlign: "center",
                            borderRadius: 15,
                            borderColor: BaseColor.primaryColor,
                            marginHorizontal: 10,
                            borderWidth: 2,
                            textAlignVertical: "center",
                            padding: 10,
                            color: BaseColor.primaryColor
                          },
                          isFocused && {
                            borderColor: BaseColor.primaryBorderColor
                          }]}
                      >
                        {symbol || (isFocused ? <Cursor /> : null)}
                      </Text>
                    )}
                  />
                  :
                  _CHANGESTATE &&
                  <>
                    <Text primaryColor title3 style={styles.setting_item_title}>{"Current status"}</Text>
                    {user.state &&
                      <View style={[styles.state_item, { alignItems: "center" }]}>
                        <ImageBackground
                          resizeMode={"stretch"}
                          source={Images.header_back}
                          style={[styles.state_check, styles.center]}>
                          {!selected && <Icon name={"check"} color={BaseColor.primaryBorderColor} size={20} />}
                        </ImageBackground>
                        <Text headline>{user.state}</Text>
                      </View>
                    }
                    <Text primaryColor title3 style={[styles.setting_item_title, { marginTop: 10 }]}>{"Recommended status"}</Text>
                    {userState.map(item => (
                      item.id != user.n_state &&
                      <TouchableOpacity key={item.id} style={[styles.state_item, { alignItems: "center" }]} onPress={() => this.setEdit({ selected: item.id })}>
                        <ImageBackground
                          resizeMode={"stretch"}
                          source={Images.header_back}
                          style={[styles.state_check, styles.center]}>
                          {selected == item.id && <Icon name={"check"} color={BaseColor.primaryBorderColor} size={20} />}
                        </ImageBackground>
                        <Text headline>{item.state}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
          }
        </View>
        <View>
          <TouchableOpacity onPress={() => this.setState({ edit: { visible: false } })}>
            <Icon name={"times"} color={BaseColor.primaryColor} size={20} />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />
          {!_CHANGEPROFILE &&
            <TouchableOpacity onPress={_VERIFYPHONE ? this.sendVerifyCode.bind(this) : this.onConfirmChange.bind(this, type)}>
              <Icon name={_VERIFYPHONE ? "sync" : "check"} color={BaseColor.primaryBorderColor} size={24} />
            </TouchableOpacity>
          }
        </View>
      </ImageBackground>
    )
  }
  touchToEdit(type) {
    const { auth: { user } } = this.props;
    this.setState({
      edit: {
        type,
        name: user.name,
        phone: user.phone,
        visible: true
      }
    });
  }
  onChangeCode(code) {
    this.setEdit({ verify_code: code });
    if (code.length < 4) {
      return;
    }
    code = code.slice(0, 4);
    code = parseInt(code);
    Keyboard.dismiss();
    if (global.verify_code != md5(code)) {
      this.props.showToast("Wrong verification code");
      this.setEdit({ verify_code: '' });
      return;
    }
    const { edit: { phone } } = this.state;
    if (phone) {
      this.updateProfile({ phone });
    }
  }
  renderSoundControl() {
    return <View style={{ flex: 1 }}></View>
  }
  renderTerms() {
    return <View style={{ flex: 1 }}></View>
  }
  renderVersion() {
    return (
      <View style={{ flex: 1, flexDirection: "row", marginTop: 40, paddingHorizontal: 20, justifyContent: "center" }}>
        <Image source={Images.btn_reaction} style={{ width: 60, height: 60, borderRadius: 12 }} />
        <View style={{ flex: 1, marginLeft: 20 }}>
          <Text whiteColor title3>{global.config?.app_version}</Text>
          <Text whiteColor headline>{global.config?.app_update_date}</Text>
          <Text whiteColor title3>{global.config?.admin_contacts}</Text>
        </View>
      </View>
    )
  }
  render() {
    const { auth: { user } } = this.props;
    const { edit, pickerData } = this.state;
    return (
      <View style={[styles.container, styles.center]}>

        {edit.visible &&
          <TouchableOpacity
            onPress={() => this.setEdit({ visible: false })}
            activeOpacity={1}
            style={styles.edit_dlg_view} />
        }
        <Profile1
          user={user}
          EDIT_TYPE={EDIT_TYPE}
          show_header
          show_state={edit.type != EDIT_TYPE.BLOCKCONTACTS && edit.type != EDIT_TYPE.ARCHIVECONTACTS}
          onLayout={(event, type) => this.measureView(event, type)}
          onPress={(type) => this.touchToEdit(type)}
          onBackPress={this.onGoBack}
        />
        {edit.type == EDIT_TYPE.SETTINGS ?
          <>
            <ScrollView style={styles.settings}>
              {_PERSON_SETTING_ITEMS.map(item => this.renderSettingItem(item))}
            </ScrollView>
          </> :
          (edit.type == EDIT_TYPE.BLOCKCONTACTS || edit.type == EDIT_TYPE.ARCHIVECONTACTS) ?
            <BlockContacts isBlockContacts={edit.type == EDIT_TYPE.BLOCKCONTACTS} />
            :
            edit.type == EDIT_TYPE.SOUNDCONTROL ? this.renderSoundControl()
              :
              edit.type == EDIT_TYPE.TERMSCONDITIONS ? this.renderTerms()
                :
                edit.type == EDIT_TYPE.VERISON ? this.renderVersion()
                  :
                  <ScrollView
                    onLayout={(event) => this.measureView(event, "SCROLLVIEW")}
                    style={styles.settings}>
                    {_SETTING_ITEMS.map(item => this.renderSettingItem(item))}
                  </ScrollView>
        }
        {this.renderEditView()}

        {pickerData &&
          <ModalPickerImage
            ref={(ref) => { this.myCountryPicker = ref; }}
            data={pickerData}
            onChange={(country) => this.phoneRef.selectCountry(country.iso2)}
            cancelText={translate('Cancel')}
          />
        }
      </View>
    );
  }
}

const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(ProfileSettings);
