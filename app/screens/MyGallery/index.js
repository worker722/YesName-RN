import * as reduxActions from "@actions";
import { Header, Icon, Image, PhotoGrid, Text } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import { getDeviceHeight, getDeviceWidth } from "@utils";
import React, { Component } from "react";
import { ImageBackground, TouchableOpacity, View } from "react-native";
import ImagePicker from 'react-native-image-crop-picker';
import { connect } from "react-redux";
import styles from "./styles";
const { ApiActions, logger } = reduxActions;

class MyGallery extends Component {
  state = {
    selectedItems: [],
    selectable: false,
  }
  constructor(props) {
    super(props);
    this.onGoBack = this.onGoBack.bind(this);
    this.chooseMedia = this.chooseMedia.bind(this);
    this.onDeleteGallery = this.onDeleteGallery.bind(this);
    this.getNewTheme = this.getNewTheme.bind(this);
    this.onCancelSelection = this.onCancelSelection.bind(this);
  }
  onGoBack() {
    this.props.navigation.goBack();
  }
  getUpdatedTheme() {
    const { stories: { mystory } } = this.props;
    const galleryLength = mystory?.gallery?.length;
    let themes = mystory?.story?.themes;
    try {
      themes = themes.split(",");
    } catch (err) {
      themes = [];
    }

    if (themes.length <= 0) {
      themes = [0];
    } else {
      let last_theme_index = themes[themes.length - 1];
      last_theme_index = parseInt(last_theme_index);
      const THEME_NUM = BaseConfig.THEME_IMAGE_NUM;
      if (galleryLength >= THEME_NUM[last_theme_index]) {
        const tmeme_rand_index = parseInt(Math.random() * THEME_NUM.length);
        themes = [...themes, tmeme_rand_index];
      }
    }
    return themes.join(",");
  }
  getNewTheme() {

  }
  async addStory(image) {
    let themes = this.getUpdatedTheme();
    const delay = 3;
    await ApiActions.addStoryMedia({ image, themes, delay });
    this.props.getMyStory(true);
  }
  chooseMedia() {
    const options = {
      width: getDeviceWidth(),
      height: getDeviceHeight(),
      cropping: true,
    };
    const response = async (image) => {
      const choose_image = {
        type: image.mime || "image/png",
        name: `${new Date().getTime()}.${image?.mime?.split("/")[1] || "avatar.png"}`,
        uri: image.path
      };
      const res = await this.props.uploadFile2Server(choose_image, BaseConfig.UPLOADTYPE.GALLERY);
      if (res.success) {
        this.addStory(res.path);
      }
    }
    ImagePicker.openCamera(options)
      .then(response)
      .catch(err => logger.log("opem image picker error", err));
  }
  onSelectImage({ id }) {
    let { selectedItems } = this.state;
    const index = selectedItems.indexOf(id);
    if (index >= 0) {
      selectedItems.splice(index, 1);
    } else {
      selectedItems = [...selectedItems, id];
    }
    this.setState({ selectedItems });
  }
  checkSelectedAll() {
    const { selectedItems } = this.state;
    const { stories: { mystory: { gallery } } } = this.props;
    try {
      if (selectedItems.length <= 0) return false;

      return selectedItems.length >= gallery.length;
    } catch (err) {
      return false
    }
  }
  toggleSelectAll() {
    const { stories: { mystory: { gallery } } } = this.props;
    let selectedItems = [];
    if (!this.checkSelectedAll()) {
      selectedItems = gallery?.map(item => item.id);
    }
    this.setState({ selectedItems });
  }
  async onDeleteGallery() {
    const { selectedItems } = this.state;
    if (!selectedItems || selectedItems.length <= 0) return;
    this.props.showLoading(true);
    try {
      await ApiActions.deleteGallery(selectedItems)
      this.props.getMyStory(true);
    } catch (err) { }
    this.props.showLoading(false)
    this.onCancelSelection();
  }
  renderButton(onPress, enabled, text, icon) {
    return (
      <TouchableOpacity onPress={enabled && onPress}>
        <ImageBackground
          resizeMode={"stretch"}
          source={enabled ? Images.header_back : Images.gray_back}
          style={[styles.action_button, styles.center]}
        >
          {icon && <Icon name={icon} size={16} color={BaseColor.primaryColor} />}
          <Text headline bold primaryColor style={{ marginLeft: 5 }}>{text}</Text>
        </ImageBackground>
      </TouchableOpacity>
    )
  }
  onCancelSelection() {
    this.setState({
      selectable: false,
      selectedItems: []
    })
  }
  render() {
    const { stories: { mystory: { story, gallery } } } = this.props;
    const { selectedItems, selectable } = this.state;
    const selectedAll = this.checkSelectedAll();
    let themes = [];
    try {
      themes = story.themes.split(",");
    } catch (err) { }
    return (
      <View style={styles.container}>
        <Header
          leftBack
          onPressLeft={this.onGoBack}
          title={"Gallery"}
          renderRight={selectable && <Icon name={'times'} size={25} color={BaseColor.primaryColor} />}
          OnPressRight={selectable && this.onCancelSelection}
        />
        <View style={styles.contain}>
          <View style={styles.toolbar}>
            {selectable ?
              <>
                <TouchableOpacity onPress={this.toggleSelectAll.bind(this)} style={styles.select_all}>
                  <Image noloading nopreview source={Images.ic_check[selectedAll ? "checked" : "unchecked"]} style={styles.chk_select_all} />
                  <Text headline whiteColor>Select all</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                {this.renderButton(this.onDeleteGallery, selectedItems.length > 0, "Delete", "trash")}
              </>
              :
              <>
                {this.renderButton(this.chooseMedia, true, "Add", "plus")}
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={this.getNewTheme}>
                  <Icon name={"sync-alt"} size={25} color={BaseColor.primary2Color} />
                </TouchableOpacity>
              </>
            }
          </View>
          <View style={styles.gallery}>
            <PhotoGrid
              images={gallery}
              theme={themes}
              selectable={selectable}
              selectedItems={selectedItems}
              onPress={(item) => selectable ? this.onSelectImage(item) : this.props.navigation.navigate("PreviewImage", { images: [item.link] })}
              onLongPress={() => this.setState({ selectable: true })}
            />
          </View>
        </View>
      </View>
    );
  }
}


const mapStateToProps = (state) => (state)
const mapDispatchToProps = {
  ...reduxActions
}

export default connect(mapStateToProps, mapDispatchToProps)(MyGallery);