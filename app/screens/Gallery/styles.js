import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BaseColor.primaryColor,
  },
  contain: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
  },
  stories: {
    marginRight: 15,
  },
  story_item: {
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  story_border: {
    borderRadius: 1000,
    borderColor: BaseColor.transparent,
    borderWidth: 3,
  },
  friends: {
    width: 55,
    height: 55,
    borderRadius: 999,
  },
  gallery: {
    flex: 1,
    paddingTop: 2
  },
  overlay: {
    width: "65%",
    padding: 20,
    borderRadius: 8,
    justifyContent: "center"
  },
  action: {
    flexDirection: "row",
    justifyContent: "center"
  },
  close: {
    position: "absolute",
    top: -15,
    right: -15,
    backgroundColor: BaseColor.blackColor,
    borderRadius: 999,
    padding: 2
  }
});
