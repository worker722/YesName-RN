import { Icon } from "@components";
import { BaseColor, Images } from "@config";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { ImageBackground, TouchableOpacity, View } from "react-native";

export default class index extends Component {
  render() {
    const { styles, onPress, padding, active, size, disable, renderContent, flex } = this.props;
    const bubble_size = (padding * 2 + size) || 30;
    const renderElement = () => {
      return <ImageBackground
        source={Images.ic_back[active]}
        style={[{
          borderRadius: 100,
          overflow: "hidden",
          width: bubble_size,
          height: bubble_size,
          alignItems: "center",
          justifyContent: "center",
          marginHorizontal: 2,
        }, styles]}>
        {renderContent || <Icon {...this.props} onPress={null} />}
      </ImageBackground>
    }
    const RenderComponent = disable ? View : TouchableOpacity;
    return (
      <RenderComponent style={flex ? { flex: 1, justifyContent: "center", alignItems: "center" } : {}} onPress={onPress}>
        {renderElement()}
      </RenderComponent>
    )
  }
}

index.propTypes = {
  padding: PropTypes.number,
  onPress: PropTypes.func,
  active: PropTypes.oneOf(['active', 'deactive', 'default', 'default1']),
  size: PropTypes.number,
  color: PropTypes.any,
  disable: PropTypes.bool,
  flex: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};

index.defaultProps = {
  padding: 8,
  active: 'deactive',
  size: 20,
  color: BaseColor.primaryColor,
  disable: false,
  style: {},
  flex: false
};
