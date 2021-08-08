/* eslint-disable */
import { Images } from "@config";
import { image_uri, date2str, translate } from "@utils";
import React, { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default memo(function UserView(props) {
  return (
    <View style={styles.userView}>
      <Image source={image_uri(props.profile)} style={styles.image} />
      <View style={{ flex: 1 }}>
        <View style={styles.barUsername}>
          <Text style={styles.name}>{props.name}</Text>
        </View>

        <Text style={styles.time}>
          {!!props.datePublication &&
            `${translate("Published")} ${date2str(props.datePublication, 0)}`}
        </Text>
      </View>
      <TouchableOpacity onPress={props.onClosePress}>
        <Image source={Images.ic_times} style={styles.ic_times} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  barUsername: {
    flexDirection: "row",
    alignItems: "center",
  },
  ic_times: {
    width: 20,
    height: 20,
    marginRight: 10
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 8,
  },
  verifyIcon: {
    width: 20,
    height: 20,
    marginLeft: 20,
  },
  userView: {
    flexDirection: "row",
    position: "absolute",
    top: 55,
    width: "98%",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 12,
    color: "white",
  },
  time: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 3,
    marginLeft: 12,
    color: "white",
  },
});
