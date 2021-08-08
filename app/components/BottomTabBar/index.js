/* /src/components/TabBar.js */

import * as reduxActions from "@actions";
import { Image } from "@components";
import { BaseConfig, Images } from "@config";
import React from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import posed from "react-native-pose";
import { connect } from "react-redux";

const windowWidth = Dimensions.get("window").width;
const tabWidth = windowWidth / 5;
const SpotLight = posed.View({
  route0: { x: 0 },
  route1: { x: tabWidth },
  route2: { x: tabWidth * 2 },
  route3: { x: tabWidth * 3 },
  route4: { x: tabWidth * 4 },
});

const Scaler = posed.View({
  active: { scale: 1 },
  inactive: { scale: 1 }
});

const S = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    elevation: 2,
    alignItems: "center",
  },
  tabButton: { width: tabWidth, height: "100%" },
  spotLight: {
    width: tabWidth,
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  scaler: { flex: 1, alignItems: "center", justifyContent: "center" }
});
const BottomTabBar = props => {
  const { navigation, descriptors, status: { more_plus } } = props;

  const { routes, index: activeRouteIndex } = props.state;
  return (
    <View style={S.container}>
      {Platform.OS == "android" &&
        <View style={StyleSheet.absoluteFillObject}>
          <SpotLight style={S.spotLight} pose={`route${activeRouteIndex}`}>
            <Image source={Images.ic_back.active} noloading nopreview style={{ width: 45, height: 45, borderRadius: 100 }} />
          </SpotLight>
        </View>
      }

      {routes.map((route, routeIndex) => {
        const isRouteActive = routeIndex === activeRouteIndex;
        return (
          <TouchableOpacity
            key={routeIndex}
            style={S.tabButton}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (route.name == "Plus") {
                if (more_plus.visible)
                  props?.destroyView();
                else
                  props?.showMoreDlg();
                return;
              } else {
                props.changeSecurityBar(false);
                props.changeSecurity(false);
              }
              if (route.name == "Camera") {
                navigation.navigate("CustomCamera", { type: BaseConfig.CAMERATYPE.REACTION });
                return;
              }
              if (!isRouteActive && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          >
            <Scaler
              pose={isRouteActive ? "active" : "inactive"}
              style={S.scaler}
            >
              {Object.values(descriptors)[routeIndex].options.tabBarIcon()}
            </Scaler>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// export default TabBar;
const mapStateToProps = (status) => (status)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(BottomTabBar);