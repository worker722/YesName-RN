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
  header: {
    paddingHorizontal: 30,
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
  },
  user_profile: {
    position: "absolute",
    bottom: -6,
    alignItems: "center",
    width: "100%",
    left: 0,
    paddingHorizontal: 20,
    height: "100%",
  },
  user_name: {
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    overflow: "hidden"
  },
  user_state: {
    marginTop: 12
  },
  settings: {
    padding: 20,
    paddingTop: 30,
    width: "100%"
  },
  setting_item: {
    flex: 1,
    flexDirection: "row",
    marginVertical: 12
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
  edit_dlg_view: {
    position: "absolute",
    backgroundColor: "#00000044",
    width: "100%",
    height: "100%",
    zIndex: 1
  },
  edit_dlg: {
    position: "absolute",
    padding: 8,
    width: "90%",
    marginLeft: "5%",
    zIndex: 2,
    borderRadius: 8,
    overflow: "hidden",
    flexDirection: "row",
    paddingVertical: 10,
  },
  change_profile: {
    flexDirection: "row",
    marginTop: 10
  },
  gallery_item_icon: {
    width: 35,
    height: 35,
  },
  input_field: {
  },
  phone_text: {
    height: 60,
    fontSize: 22
  },
  state_item: {
    marginHorizontal: 5,
    marginVertical: 10,
    flexDirection: "row"
  },
  state_check: {
    width: 25,
    height: 25,
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 10
  }
});
