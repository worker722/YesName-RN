import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import ProgressBar from './ProgressBar';


const ProgressArray = (props) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (props.pause) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [props.pause]);

  return (
    <Animated.View style={[styles.progressBarArray, { opacity }]}>
      {props.length.map((i, index) => (
        <ProgressBar
          index={index}
          key={i}
          duration={props.duration || 3}
          currentIndex={props.currentIndex}
          next={props.next}
          length={props.stories.length}
          active={i === props.currentIndex ? 1 : i < props.currentIndex ? 2 : 0}
          isLoaded={props.isLoaded}
          pause={props.pause}
          isNewStory={props.isNewStory}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  progressBarArray: {
    flexDirection: 'row',
    position: 'absolute',
    top: 36,
    width: '98%',
    height: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ProgressArray;
