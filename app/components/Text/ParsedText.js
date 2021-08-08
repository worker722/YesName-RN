import React from 'react';
import { Linking, StyleSheet } from "react-native";
import ParsedText from 'react-native-parsed-text';

export default class index extends React.Component {
  static displayName = 'Example';

  handleUrlPress(url, matchIndex /*: number*/) {
    Linking.openURL(url);
  }

  handlePhonePress(phone, matchIndex /*: number*/) {
    const url = `tel:${phone}`
    Linking.openURL(url)

  }

  render() {
    return (
      // https://www.npmjs.com/package/react-native-parsed-text
      <ParsedText
        style={this.props.style}
        parse={[
          { type: 'url', style: styles.url, onPress: this.handleUrlPress },
          { type: 'phone', style: styles.phone, onPress: this.handlePhonePress },
          { type: 'email', style: styles.email },
        ]}
      >
        {this.props.children}
      </ParsedText>
    );
  }
}

const styles = StyleSheet.create({
  url: {
    color: 'red',
    textDecorationLine: 'underline',
  },
  email: {
    textDecorationLine: 'underline',
  },
  phone: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
