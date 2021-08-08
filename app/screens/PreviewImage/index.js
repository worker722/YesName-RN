import { Icon, BubbleImage } from "@components";
import { BaseColor, Images } from "@config";
import { image_uri, translate } from '@utils';
import React, { Component } from "react";
import { ActivityIndicator, FlatList, Image, TouchableOpacity, View, Platform } from "react-native";
import ImageViewer from 'react-native-image-zoom-viewer';
import PhotoEditor from 'react-native-photo-editor';
import PhotoEditSDK from "react-native-photoedit-sdk";
import { connect } from "react-redux";
import PathParse from "path-parse";
import * as reduxActions from "@actions";
import { getDeviceWidth, getDeviceHeight } from "@utils";
const { logger } = reduxActions;

class PreviewImage extends Component {
  constructor(props) {
    super(props);
    let { route: { params } } = this.props;
    this.params = params;
    this.params.editable = true;
    this.state = {
      indexSelected: this.params.index || 0,
      images: this.params.images
    }
  }
  get getData() {
    try {
      let { images } = this.state;
      images = images.map(item => {
        return {
          ...image_uri(item, "url"),
          width: getDeviceWidth(),
          height: getDeviceHeight(),
          props: {
            resizeMode: 'contain'
          }
        };
      });
      return images;
    } catch (err) { }
    return [];
  }
  componentDidMount() {
    const { security } = this.params;
    if (security) {
      const limit = parseInt(global.config?.security_image_timeout);
      setTimeout(() => {
        this.props.navigation.goBack();
      }, limit > 0 ? limit : 30000);
    }
  }
  onTouchImage(touched) {
    if (touched == this.state.indexSelected) return;
    this.setState({ indexSelected: touched });
  }
  onSelect(index) {
    this.setState({ indexSelected: index, }, () => {
      this.flatListRef.scrollToIndex({
        animated: true,
        index
      });
    });
  }
  editImage(url) {
    return new Promise((resolve, reject) => {
      const onDone = (uri) => {
        resolve(uri);
      };
      const onCancel = (code) => reject(code);
      if (Platform.OS == "android") {
        url = url.replace("file://", "");
        PhotoEditSDK.Edit({
          path: url,
          visible_gallery: false,
          visible_camera: false,
          draw_watermark: true,
          watermark: Images.logo,
          confirm_message: null,
          onDone,
          onCancel
        });
        return;
      } else {
        let stickers = [];
        for (let i = 0; i < 119; i++) {
          stickers.push(`image_${i}`);
        }
        PhotoEditor.Edit({
          path: url,
          hiddenControls: ['save', 'share'],
          stickers,
          onDone: (uri) => {
            uri = uri.replace("file:///", "");
            this.props.navigation.navigate("ImageFilter", { uri, onDone });
          },
          onCancel
        });
      }
    })
  }
  onEdit() {
    let { indexSelected, images } = this.state;
    this.editImage(images[indexSelected].path)
      .then(res => {
        images[indexSelected].path = `file://${res}`;
        this.setState({ images: [...images] });
      })
      .catch(err => logger.log({ err }));
  }
  onDone() {
    let { images } = this.state;
    this.params?.onDone?.(images);
    this.props?.navigation?.goBack();
  }
  async download() {
    let { indexSelected, images } = this.state;
    let url = images[indexSelected];
    if (typeof url == 'object') {
      url = url.path;
    }
    const path = PathParse(url);
    this.props.showLoading(true, "Downloading...");
    const down_path = await this.props.downloadFile(path.base, url, !this.params.isgif, true)
    this.props.showLoading(false);
    this.props.showToast(`${translate('Download is done!')} \n ${down_path} `);
  }
  render() {
    const { indexSelected } = this.state;
    return (
      <ImageViewer
        imageUrls={this.getData}
        enableSwipeDown={true}
        index={indexSelected}
        swipeDownThreshold={200}
        loadingRender={() => <ActivityIndicator color={BaseColor.whiteColor} size={'large'} />}
        onChange={this.onSelect.bind(this)}
        renderIndicator={() => <ActivityIndicator color={BaseColor.whiteColor} size={'large'} />}
        onSwipeDown={this.props.navigation.goBack}
        failImageSource={translate("Image loading failed")}
        saveToLocalByLongPress={false}
        renderHeader={() => (
          <View style={{ position: "absolute", zIndex: 9999, right: 15, top: 35, }}>
            <TouchableOpacity onPress={this.props.navigation.goBack}>
              <Icon name={"close"} size={35} color={BaseColor.whiteColor} type={'AntDesign'} />
            </TouchableOpacity>
          </View>
        )}
        footerContainerStyle={{ marginBottom: 60, width: "100%" }}
        renderFooter={() => (
          <>
            <View style={{ width: "100%", paddingHorizontal: 20, paddingBottom: 20, flexDirection: "row" }}>
              {this.params?.onDone && <BubbleImage onPress={this.onEdit.bind(this)} source={Images.edit} width={30} height={30} active={"default"} />}
              <View style={{ flex: 1 }} />
              <BubbleImage onPress={this.download.bind(this)} source={Images.download} styles={{ marginRight: 10 }} width={30} height={30} active={"default"} />
              {this.params?.onDone && <BubbleImage onPress={this.onDone.bind(this)} source={Images.send} width={30} height={30} active={"default"} />}
            </View>
            <FlatList
              ref={ref => this.flatListRef = ref}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              data={this.getData}
              keyExtractor={(item, index) => index.toString()}
              style={{ marginBottom: Platform.OS == "ios" ? 40 : 0 }}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => this.onTouchImage(index)} activeOpacity={0.9}>
                  <Image
                    style={{
                      width: 60,
                      height: 60,
                      margin: 4,
                      borderRadius: 4,
                      borderColor: index == indexSelected ? BaseColor.lightPrimaryColor : BaseColor.grayColor,
                      borderWidth: 1
                    }}
                    source={{ uri: item.url }}
                  />
                </TouchableOpacity>
              )}
            />
          </>
        )}
      />
    );
  }
}
const mapDispatchToProps = { ...reduxActions }
export default connect(null, mapDispatchToProps)(PreviewImage);
