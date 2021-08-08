import { ApiActions } from "@actions";
import { Avatar, BubbleImage, Icon, Text } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import { getDeviceHeight, getDeviceWidth, translate } from "@utils";
import React, { useEffect, useState } from "react";
import {
  Keyboard, ScrollView, StyleSheet, TextInput, TouchableOpacity, View
} from "react-native";
import GestureRecognizer from 'react-native-swipe-gestures';
import ProgressArray from "./ProgressArray";
import Story from "./Story";
import UserView from "./UserView";
const SCREEN_WIDTH = getDeviceWidth();
const SCREEN_HEIGHT = getDeviceHeight();
import { logger } from "@actions";

const StoryContainer = (props) => {
  const { dataStories, init_index, isStop } = props;
  const { stories = [] } = dataStories || {};
  const [currentIndex, setCurrentIndex] = useState(init_index < stories.length ? init_index : 0);
  const [isPause, setIsPause] = useState(isStop);
  const [isLoaded, setLoaded] = useState(false);
  const [duration, setDuration] = useState(3);
  const [isForward, setForward] = useState(false);
  const [forwardMsg, setForwardMsg] = useState(null);
  const story = stories.length ? stories[currentIndex] : {};
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(460);
  const [isShowMore, setShowMore] = useState(false);
  const [isTouch, setTouch] = useState(false);
  let scrollView = React.createRef();

  useEffect(() => {
    let keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", keyboardDidShow);
    let keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", keyboardDidHide);
    visiteStory(currentIndex);
    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);
  const visiteStory = (newIndex) => {
    logger.log("visiteStory 1", init_index, newIndex);
    if (init_index < newIndex) {
      logger.log("visiteStory 2", story?.storyid, newIndex);
      props.visiteStory(story?.storyid, newIndex);
    }
  }

  const keyboardDidShow = (e) => {
    setKeyboardVisible(true);
    setKeyboardHeight(e.endCoordinates.height);
  };
  const keyboardDidHide = (e) => {
    setKeyboardVisible(false);
  };

  const changeStory = (evt) => {
    if (evt.locationX > SCREEN_WIDTH / 2) {
      nextStory();
    } else {
      prevStory();
    }
  };
  const nextStory = () => {
    const newIndex = currentIndex + 1;
    visiteStory(newIndex);
    if (stories.length > newIndex) {
      setCurrentIndex(newIndex);
      setLoaded(false);
      setDuration(3);
    } else {
      setCurrentIndex(0);
      props.onStoryNext();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0 && stories.length) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setLoaded(false);
      setDuration(3);
    } else {
      setCurrentIndex(0);
      props.onStoryPrevious();
    }
  };

  const onImageLoaded = () => {
    setLoaded(true);
  };

  const onVideoLoaded = (length) => {
    setLoaded(true);
    setDuration(length.duration);
  };

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  const onSwipeDown = () => {
    if (isForward) {
      setIsPause(false);
      setForward(false);
      setForwardMsg(null);
    } else {
      props.onClose();
    }
  }
  const onSwipeUp = () => {
    if (props.type == 0) {
      setIsPause(true);
      setForward(true);
      setForwardMsg(null);
    }
  }
  const sendMessage = () => {
    let content = forwardMsg.trim();
    content = content.replace(/'/g, "\\'");
    content = content.replace(/"/g, "\\\"");
    if (!content) return;
    setIsPause(false);
    setForward(false);
    setForwardMsg(null);

    const sender = ApiActions._CURRENTUSERID();
    const receiver = dataStories.user.id;
    const storyid = story?.storyid;
    const message = {
      sender,
      receiver,
      content,
      type: BaseConfig.CONTENTTYPE.STORY,
      currentIndex,
      storyid
    };
    props.sendMessage(message);
  }
  const getUsers = () => {
    const { all_users, visited_mystory } = props;
    const myid = ApiActions._CURRENTUSERID();
    let visited = visited_mystory?.filter(item => (currentIndex < item.visite_num && item.userid != myid));
    let visited_user = visited?.map(item => all_users.find(user => user.id == item.userid))
    visited_user = visited_user.sort((a, b) => a.updated_at - b.updated_at);
    return visited_user;
  }
  const renderVisitedUsers = () => {
    let users = getUsers();
    const count = users.length;
    if (users.length <= 0) {
      return <></>;
    }
    if (!isShowMore) {
      const show_count = 2;
      let new_users_list = [];
      for (let i = users.length - show_count; i < users.length; i++) {
        new_users_list.push(users[i]);
      }
      users = new_users_list;
    }
    return (
      <View
        style={styles.visited_users}>
        <TouchableOpacity
          onPress={() => {
            const pause = !isShowMore;
            setShowMore(pause)
            setIsPause(pause);
          }}
          style={styles.show_more}>
          <Text headline bold whiteColor borderTopLeftRadius>{count} {translate("Visited")}</Text>
          {count > 2 && <Icon name={isShowMore ? "angle-down" : "angle-up"} style={styles.show_more_icon} color={BaseColor.whiteColor} size={20} />}
        </TouchableOpacity>
        <ScrollView
          ref={(view) => scrollView = view}
          onContentSizeChange={(_, height) => {
            try {
              scrollView?.scrollTo({ y: height })
            } catch (error) { }
          }}
          style={styles.users_list_contain}
        >
          {users.map((item, index) => (
            item && <View key={index} style={styles.users_item}>
              <Avatar size={'small'} user={item} />
              <Text body2 whiteColor style={styles.username}>{item.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
  return (
    <GestureRecognizer
      onSwipeUp={onSwipeUp}
      onSwipeDown={onSwipeDown}
      config={config}
      style={styles.container}
      onTouchEnd={() => setTouch(false)}
    >
      <TouchableOpacity
        activeOpacity={1}
        delayLongPress={500}
        onPress={(e) => changeStory(e.nativeEvent)}
        onLongPress={() => setTouch(true)}
        style={styles.container}
      >
        <Story
          onImageLoaded={onImageLoaded}
          pause={isPause || props.forceStop || isTouch}
          onVideoLoaded={onVideoLoaded}
          story={story}
          isNewStory={props.isNewStory}
        />
        <UserView
          name={dataStories.user?.name}
          profile={dataStories.user?.avatar}
          datePublication={stories[currentIndex]?.created_at}
          onClosePress={props.onClose}
        />
        <ProgressArray
          next={nextStory}
          isLoaded={isLoaded}
          duration={duration}
          pause={isPause || props.forceStop || isTouch}
          stories={stories}
          currentIndex={currentIndex}
          currentStory={stories[currentIndex]}
          length={stories.map((_, i) => i)}
          progress={{ id: currentIndex }}
          isNewStory={props.isNewStory}
        />
      </TouchableOpacity>
      {isForward &&
        <View style={[styles.forward, { bottom: keyboardVisible ? keyboardHeight : 0, }]}>
          <TextInput
            multiline={true}
            style={{ flex: 1, height: 45 }}
            placeholderTextColor={BaseColor.blackColor}
            placeholder={translate("Comment")}
            onChangeText={msg => setForwardMsg(msg)}
            value={forwardMsg}
          />
          <BubbleImage onPress={sendMessage} source={Images.send} width={23} height={23} active={"default1"} />
        </View>
      }
      {props.type == 1 &&
        <>
          {renderVisitedUsers()}
          <View style={styles.trash_contain}>
            <TouchableOpacity
              onPress={() => props.onDelete(story)}
              style={styles.trash_icon}>
              <Icon name={"trash"} color={BaseColor.blackColor} size={25} />
            </TouchableOpacity>
          </View>
        </>
      }

      {isStop && isPause &&
        <TouchableOpacity
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: 9999,
            borderColor: BaseColor.whiteColor,
            borderWidth: 8,
            opacity: .7,
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 10,
          }}
          onPress={() => setIsPause(false)}
        >
          <Icon name={'play'} size={36} color={BaseColor.whiteColor} />
        </TouchableOpacity>
      }
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarArray: {
    flexDirection: 'row',
    position: 'absolute',
    top: 30,
    width: '98%',
    height: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userView: {
    flexDirection: 'row',
    position: 'absolute',
    top: 55,
    width: '98%',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 12,
    color: 'white',
  },
  time: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 3,
    marginLeft: 12,
    color: 'white',
  },
  content: {
    width: '100%',
    height: '100%',
  },
  loading: {
    backgroundColor: 'black',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '100%',
    height: '90%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bar: {
    width: 50,
    height: 8,
    backgroundColor: 'gray',
    alignSelf: 'center',
    borderRadius: 4,
    marginTop: 8,
  },
  visited_users: {
    position: "absolute",
    bottom: 15,
    left: 10,
    maxHeight: SCREEN_HEIGHT * .6,
    backgroundColor: BaseColor.blackLightOpacity,
    borderRadius: 8,
    padding: 4,
    paddingHorizontal: 10,
  },
  show_more: {
    flex: 1,
    borderBottomColor:
      BaseColor.whiteColor,
    borderBottomWidth: .6,
    paddingBottom: 4,
    marginBottom: 4
  },
  show_more_icon: {
    transform: [{ scaleX: 1.6 }],
    marginLeft: 30,
    marginBottom: -5
  },
  users_list_contain: {
    paddingRight: 12
  },
  users_item: {
    flexDirection: "row",
    paddingHorizontal: 2,
    marginVertical: 4,
    alignItems: "center"
  },
  username: {
    marginLeft: 5,
  },
  forward: {
    position: "absolute",
    width: "94%",
    marginLeft: "3%",
    paddingHorizontal: 15,
    margin: 10,
    backgroundColor: BaseColor.whiteColor,
    borderRadius: 9999,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  trash_contain: {
    position: "absolute",
    bottom: 15,
    right: 10,
  },
  trash_icon: {
    width: 45,
    height: 45,
    backgroundColor: BaseColor.whiteColor,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default StoryContainer;
