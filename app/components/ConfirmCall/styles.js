import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: BaseColor.blackOpacity2,
  },
  center: {
    justifyContent: "center",
    alignItems: "center"
  },
  contain: {
    backgroundColor: BaseColor.whiteColor,
    borderRadius: 8,
    paddingVertical: 20,
  },
  username: {
    marginTop: 8,
    marginVertical: 3
  },
  actions: {
    marginTop:20,
    flexDirection: "row"
  },
  voice_action: {
    backgroundColor: BaseColor.primary2Color,
    borderRadius: 9999,
    width: 50,
    height: 50,
    marginHorizontal: 25
  },
  close_action: {
    position: "absolute",
    top: 15,
    right: 15
  }

});
