import { BubbleIcon } from "@components";
import React, { Component } from "react";
import { Image } from "react-native";

export default class index extends Component {
  render() {
    const { source, size, width, height } = this.props;
    return (
      <BubbleIcon size={size || (width > height ? width - 2 : height - 2)} padding={10} renderContent={<Image source={source} resizeMode={'contain'} style={{ width: width || size, height: height || size }} />} {...this.props} />
    )
  }
}