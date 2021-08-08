import { BaseColor } from "@config";
import { Platform, StyleSheet } from "react-native";
const ANDROID_DEVICE = Platform.OS == "android";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    // position: "absolute",
    flex: 1,
    // width: "100%",
    // height: "100%"
  },
  marker: {
    paddingHorizontal: 14,
    paddingBottom: 24,
    paddingTop: 8
  },
  marker_avatar: {
    width: 20,
    height: 20,
    borderRadius: 999
  },
  shadow: {
    shadowColor: BaseColor.blackColor,
    shadowOffset: {
      width: 0,
      height: ANDROID_DEVICE ? 14 : 1,
    },
    shadowOpacity: 1,
    shadowRadius: ANDROID_DEVICE ? 16 : 2,
    elevation: ANDROID_DEVICE ? 14 : 4,
  },
  autocomplete_input: {
    paddingHorizontal:45,
    color: BaseColor.blackColor,
    fontSize: 16,
    margin: 2,
  },
  location_preview: {
    width: "100%",
    backgroundColor: BaseColor.blackOpacity,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    paddingVertical: 30
  },
  description: {
    textAlign: "center",
    marginBottom: 5
  },
  actions: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
    width: "60%"
  },
  cancel_action: {
    backgroundColor: BaseColor.redColor,
    paddingHorizontal: 14
  },
  confirm_action: {
    paddingHorizontal: 14
  }
});
