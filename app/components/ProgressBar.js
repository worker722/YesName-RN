import { BaseColor } from "@config";
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const ProgressBar = (props) => {
  const { duration } = props;
  const scale = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);

  const onLayoutAdded = evt => {
    setWidth(evt.width);
  };

  useEffect(() => {
    if (props.isLoaded) {
      return Animated.timing(scale, {
        toValue: width,
        duration: getDuration(),
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) props.onFinish();
      })
    } else {
      scale.setValue(0);
    }
  }, [props.isLoaded]);

  const getDuration = () => {
    const totalPlaytime = duration * 1000;
    return totalPlaytime;
  };

  return (
    <View style={{ top: getStatusBarHeight(), position: "absolute", width: "100%" }}>
      <View
        onLayout={evt => onLayoutAdded(evt.nativeEvent.layout)}
        style={[styles.container]}>
        <Animated.View
          style={[
            styles.container,
            {
              width: scale,
              position: 'absolute',
              backgroundColor: BaseColor.mintgreen,
              top: 0,
              margin: 0,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 4,
    backgroundColor: "#555",
    width: "100%",
  },
});

export default ProgressBar;
