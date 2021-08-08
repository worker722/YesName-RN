import { BaseColor, BaseConfig } from "@config";
import { StyleSheet } from "react-native";
const { TABBAR_HEIGHT } = BaseConfig;
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BaseColor.primaryColor,
  },
  contain: {
    flex: 1,
    padding: 16
  },
  stories: {
    marginRight: 20,
  },
  avatar: {
    width: 45,
    height: 45
  },
  story_item: {
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  story_border: {
    borderRadius: 1000,
    borderColor: BaseColor.transparent,
    borderWidth: 3,
  },
  friends: {
    width: 70,
    height: 70,
  },
  gallery: {
    flex: 1,
  },
  tabbar: {
    height: TABBAR_HEIGHT,
    marginHorizontal: 2,
    backgroundColor: BaseColor.primary3Color,
  },
  tab: {
    position: "absolute",
    width: "54%",
    height: TABBAR_HEIGHT,
    resizeMode: "stretch",
  },
  tab_back: {
    height: TABBAR_HEIGHT,
    width: "100%",
  },
  tab_right: {
    marginLeft: "46%",
  },
  tab_text: {
    height: TABBAR_HEIGHT,
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
  },
  toolbar: {
    flexDirection: "row",
    paddingHorizontal:10
  },
  center: {
    alignItems: "center",
    justifyContent: "center"
  },
  select_all: {
    flexDirection: "row",
    alignItems: "center",
  },
  chk_select_all: {
    width: 30,
    height: 30
  },
  action_button: {
    width: 90,
    height: 30,
    overflow: 'hidden',
    borderRadius: 14,
    flexDirection:"row"
  }
});
