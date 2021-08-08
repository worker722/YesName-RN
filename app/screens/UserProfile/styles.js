import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BaseColor.primaryColor
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  settings: {
    padding: 15,
    paddingTop: 30,
    width: "100%"
  },
  setting_item: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 20,
    },
  setting_item_icon: {
    width: 40,
    height: 40,
  },
  setting_item_title: {
    flex: 1,
    marginHorizontal: 10
  },
  setting_item_arrow: {
    width: 20,
    height: 20,
    borderRadius: 1000,
    overflow: "hidden",
  },
});
