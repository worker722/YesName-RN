

import React from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import BaseComponent from './BaseComponent';
import styles from './style';



let componentIndex = 0;


export default class ModalPicker extends BaseComponent {
  constructor() {
    super();

    this._bind('onChange', 'open', 'close', 'renderChildren');

    this.state = {
      animationType: 'slide',
      modalVisible: false,
      transparent: false,
      selected: 'please select',
      data: [],
    };
  }

  componentDidMount() {
    this.setState({ selected: this.props.initValue });
    this.setState({ cancelText: this.props.cancelText });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ data: nextProps.data });
  }

  onChange(item) {
    this.props.onChange(item);
    this.setState({ selected: item.label });
    this.close();
  }

  close() {
    this.setState({
      modalVisible: false,
    });
  }

  open() {
    this.setState({
      modalVisible: true,
    });
  }

  renderSection(section) {
    return (
      <View key={section.key} style={[styles.sectionStyle, this.props.sectionStyle]}>
        <Text style={[styles.sectionTextStyle, this.props.sectionTextStyle]}>{section.label}</Text>
      </View>
    );
  }

  renderOption(option) {
    return (
      <TouchableOpacity key={option.key} onPress={() => this.onChange(option)}>
        <View
          style={[
            styles.optionStyle,
            this.props.optionStyle,
            {
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
          ]}
        >
          <View style={{ flex: 0.15 }}>
            <Image source={option.image} noloading nopreview resizeMode="stretch" style={{ width: 30, height: 16 }} />
          </View>
          <View style={{ flex: 0.7, alignItems: 'center' }}>
            <Text
              style={[
                styles.optionTextStyle,
                this.props.optionTextStyle,
                { color: '#434343', fontSize: 14 },
              ]}
            >
              {option.label}
            </Text>
          </View>
          <View style={{ flex: 0.15, alignItems: 'flex-end' }}>
            <Text
              style={[
                styles.optionTextStyle,
                this.props.optionTextStyle,
                { color: 'grey', fontSize: 12 },
              ]}
            >
              {option.dialCode}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderOptionList() {
    const options = this.state.data.map((item) => {
      if (item.section) {
        return this.renderSection(item);
      }

      return this.renderOption(item);
    });

    return (
      <View
        style={[styles.overlayStyle, this.props.overlayStyle]}
        key={`modalPicker${componentIndex++}`}
      >
        <View style={styles.optionContainer}>
          <ScrollView keyboardShouldPersistTaps="always">
            <View style={{ paddingHorizontal: 10 }}>{options}</View>
          </ScrollView>
        </View>
        <View style={styles.cancelContainer}>
          <TouchableOpacity onPress={this.close}>
            <View style={[styles.cancelStyle, this.props.cancelStyle]}>
              <Text style={[styles.cancelTextStyle, this.props.cancelTextStyle]}>
                {this.props.cancelText}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderChildren() {
    if (this.props.children) {
      return this.props.children;
    }
  }

  render() {
    const dp = (
      <Modal
        transparent
        ref={(ref) => { this.modal = ref; }}
        visible={this.state.modalVisible}
        onRequestClose={this.close}
        animationType={this.state.animationType}
      >
        {this.renderOptionList()}
      </Modal>
    );

    return (
      <View style={this.props.style}>
        {dp}

        <TouchableOpacity onPress={this.open}>{this.renderChildren()}</TouchableOpacity>
      </View>
    );
  }
}
