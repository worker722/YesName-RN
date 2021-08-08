import { Text } from "@components";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Fontisto from "react-native-vector-icons/Fontisto";
import Foundation from "react-native-vector-icons/Foundation";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Octicons from "react-native-vector-icons/Octicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Zocial from "react-native-vector-icons/Zocial";

const _COMPONENTS = {
  "AntDesign": AntDesign,
  "Entypo": Entypo,
  "EvilIcons": EvilIcons,
  "Feather": Feather,
  "FontAwesome": FontAwesome,
  "FontAwesome5": FontAwesome5,
  "Fontisto": Fontisto,
  "Foundation": Foundation,
  "Ionicons": Ionicons,
  "MaterialIcons": MaterialIcons,
  "MaterialCommunityIcons": MaterialCommunityIcons,
  "Octicons": Octicons,
  "Zocial": Zocial,
  "SimpleLineIcons": SimpleLineIcons,
};

export default class index extends Component {
  render() {
    const { style, name, type, ...rest } = this.props;
    if (name == "reaction") {
      return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <SimpleLineIcons name={"refresh"} style={StyleSheet.flatten([style && style, { paddingBottom: 2 }])} {...rest} />
          <Text headline primaryColor style={{ position: "absolute", color: this.props.color }}>R</Text>
        </View>
      );
    }
    let IconComponent = _COMPONENTS[type || FontAwesome5] || FontAwesome5;

    return <IconComponent name={name} style={StyleSheet.flatten([style && style])} {...rest} />;
  }
}

index.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

index.defaultProps = {
  style: {},
};
