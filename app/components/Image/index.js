import { Icon } from "@components";
import { BaseColor } from "@config";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image as ImageElement } from 'react-native-elements';

export default class index extends Component {
  state = {
    modalVisible: false,
  }
  constructor(props) {
    super(props);
    this.photoPopupToggle = this.photoPopupToggle.bind(this);
  }
  getIndicatorSize() {
    const { loadingSize } = this.props;
    switch (loadingSize) {
      case "small":
        return { size: "small", scale: 1 };
      case "medium":
        return { size: "small", scale: 1.3 };
      case "large":
        return { size: "large", scale: 1 };
      case "xlarge":
        return { size: "large", scale: 1.3 };
    }
    return { size: "small", scale: 1 };
  }
  photoPopupToggle() {
    this.setState({ modalVisible: !this.state.modalVisible });
  }
  render() {
    const { style, onPress, nopreview, resizeMode, source, round, bigLoading, loadingSize, noloading, ...rest } = this.props;
    return (
      <>
        <ImageElement
          resizeMode={resizeMode}
          {...(onPress ? { onPress } : !nopreview ? { onPress: this.photoPopupToggle } : null)}
          source={source}
          style={StyleSheet.flatten([style && style, round && { borderRadius: 1000 }])}
          PlaceholderContent={
            !noloading &&
            <ActivityIndicator style={{ transform: [{ scale: this.getIndicatorSize().scale }] }} size={this.getIndicatorSize().size} color={BaseColor.blackColor} />
          }
          placeholderStyle={{ backgroundColor: noloading ? BaseColor.transparent : BaseColor.whiteColor }}
          containerStyle={noloading && { backgroundColor: BaseColor.transparent }}
          {...rest}
        />
        <Modal
          animationType={"fade"}
          transparent={false}
          backdropColor='transparent'
          visible={this.state.modalVisible}>
          <ImageElement
            source={source}
            style={{
              width: null,
              height: "100%",
              resizeMode: 'contain',
              alignSelf: 'center',
            }} />
          <View style={{ position: "absolute", right: 20, top: 10, zIndex: 99999 }}>
            <TouchableOpacity onPress={this.photoPopupToggle}>
              <Icon name={'times'} size={30} color={BaseColor.blackColor} />
            </TouchableOpacity>
          </View>
        </Modal>
      </>
    )
  }
}

index.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  source: PropTypes.any,
  resizeMode: PropTypes.string,
};

index.defaultProps = {
  style: {},
  source: "",
  resizeMode: "contain"
};
