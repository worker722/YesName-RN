import { Text, VideoPlayer } from "@components";
import { BaseColor } from "@config";
import { getDeviceHeight, getDeviceWidth, image_uri } from "@utils";
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
const ScreenWidth = getDeviceWidth();
const ScreenHeight = getDeviceHeight();

const Story = (props) => {
  const { story } = props;
  const { link, type } = story || {};
  const [loading, setLoading] = useState(true);
  return (
    <View style={styles.container}>
      {type === 0 ? (
        <Image
          source={image_uri(link)}
          onLoadEnd={() => {
            setLoading(false);
            props.onImageLoaded();
          }}
          style={styles.content}
          resizeMode={"contain"}
          width={ScreenWidth}
        />
      ) : (
        <VideoPlayer
          source={image_uri(link)}
          paused={props.pause || props.isNewStory}
          onLoad={item => {
            setLoading(false);
            props.onVideoLoaded(item);
          }}
          style={styles.contentVideo}
          resizeMode={'contain'}
        />
      )}
      {loading &&
        <View
          style={styles.loading_container}
        >
          <ActivityIndicator color={BaseColor.whiteColor} style={{ marginBottom: 10 }} animating size="large" />
          <Text whiteColor footnote >Loading ...</Text>
        </View>
      }
    </View>
  );
};

Story.propTypes = {
  story: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: ScreenWidth,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { width: ScreenWidth, height: ScreenHeight, flex: 1 },
  contentVideo: {
    width: ScreenWidth + 20,
    //aspectRatio: 1,
    backgroundColor: '#000',
    //flex: 1,
    height: "100%",
  },
  loading: {
    backgroundColor: 'black',
    width: ScreenWidth,
    height: ScreenHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading_container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default Story;
