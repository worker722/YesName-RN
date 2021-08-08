import { BottomTabBar, BubbleIcon, BubbleImage, Badge } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CallLogs from "@screens/CallLogs";
import Chat from "@screens/Chat";
/* Bottom Screen */
import ChatHome from "@screens/ChatHome";
import CustomCamera from "@screens/CustomCamera";
import CustomMapView from "@screens/CustomMapView";
import Gallery from "@screens/Gallery";
import ImageFilter from "@screens/ImageFilter";
import InOutCalling from "@screens/InOutCalling";
import InviteFriends from "@screens/InviteFriends";
import PreviewImage from "@screens/PreviewImage";
import PreviewReaction from "@screens/PreviewReaction";
import ProfileSettings from "@screens/ProfileSettings";
import Reaction from "@screens/Reaction";
import StoryView from "@screens/StoryView";
import VideoViewer from "@screens/VideoViewer";
import UserProfile from "@screens/UserProfile";
import Favourite from "@screens/Favourite";
import Medias from "@screens/Medias";
import React from "react";
import { ImageBackground, Platform, View } from "react-native";
import { connect } from "react-redux";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const emptyComponent = () => <></>
const TabNavigator = (props) => {
  const { chat: { normal_unread, security_unread, missedcalls }, app: { securityBar } } = props;
  return (
    <Tab.Navigator
      initialRouteName={"Gallery"}
      tabBar={props => (
        <View style={{ backgroundColor: BaseColor.primaryColor }}>
          <ImageBackground
            source={securityBar ? Images.header1_back : Images.header_back}
            resizeMode={"stretch"}
            style={{
              width: "100%",
              height: BaseConfig.BOTTOMBARHEIGHT + (Platform.OS == "android" ? 0 : 10),
              overflow: "hidden",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: (Platform.OS == "android" ? 0 : 10)
            }}
          >
            <BottomTabBar {...props} />
          </ImageBackground>
        </View>
      )}
    >
      <Tab.Screen name="Gallery" component={Gallery}
        options={{
          tabBarIcon: () => <BubbleImage source={Images.reaction} width={24} height={24} disable padding={10} />
        }}
      />
      <Tab.Screen name="ChatHome" component={ChatHome}
        options={{
          tabBarIcon: () => (
            <View style={{ paddingHorizontal: 6 }}>
              <BubbleImage source={Images.ic_chat} width={24} height={24} disable padding={10} />
              <Badge
                color={BaseColor.redColor}
                value={security_unread}
                size={20}
                topLeft
              />
              <Badge
                color={BaseColor.primaryColor}
                value={normal_unread}
                size={20}
                bottomRight
              />
            </View>
          )
        }}
      />
      <Tab.Screen name="Camera" component={emptyComponent}
        options={{
          tabBarIcon: () => <BubbleImage source={Images.ic_camera} width={24} height={24} disable padding={10} />
        }}
      />
      <Tab.Screen name="CallLog" component={CallLogs}
        options={{
          tabBarIcon: () => (
            <View style={{ paddingHorizontal: 6 }}>
              <BubbleImage source={Images.call_log} width={24} height={24} disable padding={10} />
              <Badge
                color={BaseColor.redColor}
                value={missedcalls}
                size={20}
                topRight
              />
            </View>
          )
        }}
      />
      <Tab.Screen name="Plus" component={emptyComponent}
        options={{
          tabBarIcon: () => <BubbleIcon name={'plus'} size={24} BaseColor disable padding={10} />
        }}
      />
    </Tab.Navigator>
  )
}
const mapStateToProps = (state) => (state)
const TabNavigatorComponent = connect(mapStateToProps, null)(TabNavigator);

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="TabNavigator" component={TabNavigatorComponent} />
        <Stack.Screen name="CustomCamera" component={CustomCamera} />
        <Stack.Screen name="PreviewImage" component={PreviewImage} />
        <Stack.Screen name="StoryView" component={StoryView} />
        <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="InviteFriends" component={InviteFriends} />
        <Stack.Screen name="CustomMapView" component={CustomMapView} />
        <Stack.Screen name="InOutCalling" component={InOutCalling} />
        <Stack.Screen name="VideoViewer" component={VideoViewer} />
        <Stack.Screen name="ImageFilter" component={ImageFilter} />
        <Stack.Screen name="Reaction" component={Reaction} />
        <Stack.Screen name="PreviewReaction" component={PreviewReaction} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="Favourite" component={Favourite} />
        <Stack.Screen name="Medias" component={Medias} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
