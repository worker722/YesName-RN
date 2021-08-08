import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BaseColor.primaryColor
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  skip_button: {
    // position: "absolute",
    // bottom: 50,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop:10
  },
  tabbar: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: BaseColor.primary3Color
  },
  tabbutton: {
    flex: 1,
    textAlign: "center"
  },
  select_all: {
    flexDirection: "row",
    alignItems: "center",
  },
  search_bar: {
    flexDirection: "row",
    paddingHorizontal: 15,
    backgroundColor: BaseColor.whiteColor,
    borderRadius: 16,
  }
});
