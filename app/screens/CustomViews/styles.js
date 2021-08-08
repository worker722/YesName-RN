import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    height: "50%",
    top: "25%",
    left: "10%"
  },
  subContain: {
    backgroundColor: BaseColor.blackOpacity,
    padding: 30,
    borderRadius: 10,
  },
  menuitem: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomColor: BaseColor.grayColor,
    borderBottomWidth: .4,
    alignItems: "center",
    paddingRight: 30
  },
  close: {
    position: "absolute",
    top: 8,
    right: 10
  }
});
