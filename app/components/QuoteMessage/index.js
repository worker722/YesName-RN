

import { Icon } from '@components';
import { BaseColor, BaseConfig } from '@config';
import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from './style';

export default class QuoteMessage extends Component {
  getAttach() {
    let { message: { attach, type } } = this.props;
    try { if (typeof attach == "string") attach = JSON.parse(attach); } catch (error) { return {}; }

    const { CONTENTTYPE: { FILE, CONTACTS, LOCATION, IMAGE, VIDEO, AUDIO } } = BaseConfig;
    const attach_type = type == FILE ? "File" :
      type == CONTACTS ? "Contacts" :
        type == LOCATION ? "Location" :
          type == IMAGE ? "Image" :
            type == VIDEO ? "Video" :
              type == AUDIO ? "Audio" : "Attach";
    let sub_text = type == CONTACTS ? `${attach.name}\n${attach.phone}` :
      type == LOCATION ? attach.description || `` : attach.name;

    return { text: sub_text, type: attach_type };
  }
  render() {
    if (!this.props.message?.sender) return <></>;
    const { message: { attach, content, sender, type }, onRemoveQuote, showClose, style, user } = this.props;
    const quote_message = this.getAttach();
    return (
      <View style={[styles.container, style]}>
        <View style={styles.quote_mark} />
        <View style={styles.content}>
          {!!user?.name && <Text blackColor headline style={{ marginLeft: 10 }}>{user.name}</Text>}
          {!!content && <Text blackColor title3>{content}</Text>}
          {!!quote_message?.type && <Text blackColor title3>{quote_message.type}</Text>}
          {!!quote_message?.text && <Text blackColor headline>{quote_message.text}</Text>}
        </View>
        {showClose && <View style={styles.close}>
          <TouchableOpacity onPress={onRemoveQuote}>
            <Icon name={"times"} size={20} color={BaseColor.blackColor} />
          </TouchableOpacity>
        </View>}
      </View>
    );
  }
}
