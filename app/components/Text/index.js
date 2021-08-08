import { BaseColor, FontWeight, Typography } from "@config";
import { translate } from "@utils";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, Text } from "react-native";
import ParsedText from "./ParsedText";

export default class Index extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      //props style
      header,
      title1,
      title2,
      title3,
      headline,
      body1,
      body2,
      callout,
      subhead,
      footnote,
      caption1,
      caption2,
      overline,
      // props font
      thin,
      ultraLight,
      light,
      regular,
      medium,
      semibold,
      bold,
      heavy,
      black,
      //custom color
      primaryColor,
      darkPrimaryColor,
      lightPrimaryColor,
      primaryOpacity,
      whiteColor,
      grayColor,
      dividerColor,
      blackColor,
      fieldColor,
      yellowColor,
      successColor,
      warningColor,
      dangerColor,
      redColor,
      transparent,
      blackLightOpacity,
      blackOpacity,
      kashmir,
      primary2Color,
      primary3Color,
      primaryBorderColor,
      primary4Color,
      mintgreen,
      numberOfLines,
      textParse,
      //custom
      style
    } = this.props;

    const TextElement = textParse ? ParsedText : Text;

    return (
      <TextElement
        style={StyleSheet.flatten([
          header && Typography.header,
          title1 && Typography.title1,
          title2 && Typography.title2,
          title3 && Typography.title3,
          headline && Typography.headline,
          body1 && Typography.body1,
          body2 && Typography.body2,
          callout && Typography.callout,
          subhead && Typography.subhead,
          footnote && Typography.footnote,
          caption1 && Typography.caption1,
          caption2 && Typography.caption2,
          overline && Typography.overline,
          //custom for font
          thin && StyleSheet.flatten({ fontWeight: FontWeight.thin }),
          ultraLight &&
          StyleSheet.flatten({
            fontWeight: FontWeight.ultraLight
          }),
          light && StyleSheet.flatten({ fontWeight: FontWeight.light }),
          regular && StyleSheet.flatten({ fontWeight: FontWeight.regular }),
          medium && StyleSheet.flatten({ fontWeight: FontWeight.medium }),
          semibold && StyleSheet.flatten({ fontWeight: FontWeight.semibold }),
          bold && StyleSheet.flatten({ fontWeight: FontWeight.bold }),
          heavy && StyleSheet.flatten({ fontWeight: FontWeight.heavy }),
          black && StyleSheet.flatten({ fontWeight: FontWeight.black }),
          // default color
          StyleSheet.flatten({
            color: BaseColor.textPrimaryColor
          }),

          //custom for color
          primaryColor && StyleSheet.flatten({ color: BaseColor.primaryColor }),
          darkPrimaryColor && StyleSheet.flatten({ color: BaseColor.darkPrimaryColor }),
          lightPrimaryColor && StyleSheet.flatten({ color: BaseColor.lightPrimaryColor }),
          primary4Color && StyleSheet.flatten({ color: BaseColor.primary4Color }),
          primaryOpacity && StyleSheet.flatten({ color: BaseColor.primaryOpacity }),
          whiteColor && StyleSheet.flatten({ color: BaseColor.whiteColor }),
          grayColor && StyleSheet.flatten({ color: BaseColor.grayColor }),
          dividerColor && StyleSheet.flatten({ color: BaseColor.dividerColor }),
          blackColor && StyleSheet.flatten({ color: BaseColor.blackColor }),
          fieldColor && StyleSheet.flatten({ color: BaseColor.fieldColor }),
          yellowColor && StyleSheet.flatten({ color: BaseColor.yellowColor }),
          successColor && StyleSheet.flatten({ color: BaseColor.success }),
          warningColor && StyleSheet.flatten({ color: BaseColor.warning }),
          dangerColor && StyleSheet.flatten({ color: BaseColor.danger }),
          redColor && StyleSheet.flatten({ color: BaseColor.redColor }),
          transparent && StyleSheet.flatten({ color: BaseColor.transparent }),
          blackLightOpacity && StyleSheet.flatten({ color: BaseColor.blackLightOpacity }),
          blackOpacity && StyleSheet.flatten({ color: BaseColor.blackOpacity }),
          kashmir && StyleSheet.flatten({ color: BaseColor.kashmir }),
          primary2Color && StyleSheet.flatten({ color: BaseColor.primary2Color }),
          primary3Color && StyleSheet.flatten({ color: BaseColor.primary3Color }),
          primaryBorderColor && StyleSheet.flatten({ color: BaseColor.primaryBorderColor }),
          mintgreen && StyleSheet.flatten({ color: BaseColor.mintgreen }),

          style && style
        ])}
        numberOfLines={numberOfLines}
      >
        {translate(this.props.children)}
      </TextElement>
    );
  }
}

// Define typechecking
Index.propTypes = {
  //define style
  header: PropTypes.bool,
  title1: PropTypes.bool,
  title2: PropTypes.bool,
  title3: PropTypes.bool,
  headline: PropTypes.bool,
  body1: PropTypes.bool,
  body2: PropTypes.bool,
  callout: PropTypes.bool,
  subhead: PropTypes.bool,
  footnote: PropTypes.bool,
  caption1: PropTypes.bool,
  caption2: PropTypes.bool,
  overline: PropTypes.bool,

  //define font custom
  thin: PropTypes.bool,
  ultraLight: PropTypes.bool,
  light: PropTypes.bool,
  regular: PropTypes.bool,
  medium: PropTypes.bool,
  semibold: PropTypes.bool,
  bold: PropTypes.bool,
  heavy: PropTypes.bool,
  black: PropTypes.bool,
  //custon for text color
  primaryColor: PropTypes.bool,
  darkPrimaryColor: PropTypes.bool,
  lightPrimaryColor: PropTypes.bool,
  primaryOpacity: PropTypes.bool,
  whiteColor: PropTypes.bool,
  grayColor: PropTypes.bool,
  dividerColor: PropTypes.bool,
  blackColor: PropTypes.bool,
  fieldColor: PropTypes.bool,
  yellowColor: PropTypes.bool,
  successColor: PropTypes.bool,
  warningColor: PropTypes.bool,
  dangerColor: PropTypes.bool,
  redColor: PropTypes.bool,
  transparent: PropTypes.bool,
  blackLightOpacity: PropTypes.bool,
  blackOpacity: PropTypes.bool,
  kashmir: PropTypes.bool,
  primary2Color: PropTypes.bool,
  primary3Color: PropTypes.bool,
  primaryBorderColor: PropTypes.bool,
  //numberOfLines
  numberOfLines: PropTypes.number,
  //custom style
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.node // plain text
};

Index.defaultProps = {
  //props for style
  header: false,
  title1: false,
  title2: false,
  title3: false,
  headline: false,
  body1: false,
  body2: false,
  callout: false,
  subhead: false,
  footnote: false,
  caption1: false,
  caption2: false,
  overline: false,
  //props for font
  thin: false,
  ultraLight: false,
  light: false,
  regular: false,
  medium: false,
  semibold: false,
  bold: false,
  heavy: false,
  black: false,
  //custon for text color
  primaryColor: false,
  primaryColor: false,
  darkPrimaryColor: false,
  lightPrimaryColor: false,
  primaryOpacity: false,
  whiteColor: false,
  grayColor: false,
  dividerColor: false,
  blackColor: false,
  fieldColor: false,
  yellowColor: false,
  successColor: false,
  warningColor: false,
  dangerColor: false,
  redColor: false,
  transparent: false,
  blackLightOpacity: false,
  blackOpacity: false,
  kashmir: false,
  primary2Color: false,
  primary3Color: false,
  primaryBorderColor: false,
  //numberOfLines
  numberOfLines: 0,
  //custom style
  style: {},
  children: ""
};
