import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BaseColor.blackColor,
  },
  flash_back: {
    borderRadius: 10000,
    overflow: "hidden",
    width: "100%",
    height: "100%",
    position: "absolute"
  },
  switch_camera_back: {
    width: 60,
    height: 52,
    borderRadius: 12,
    overflow: "hidden"
  },
  switch_camera: {
    width: 40,
    height: 40
  },
  gallery_back: {
    width: 70,
    height: 52,
    borderRadius: 12,
    overflow: "hidden"
  },
  gallery_icon: {
    width: 55,
    height: 50
  },
  center: {
    justifyContent: "center",
    alignItems: "center"
  },
  ic_flash: {
    width: 30,
    height: 30,
    marginHorizontal: 6,
    marginVertical: 12
  },
  ic_times: {
    width: 25,
    height: 25,
    marginTop: 5,
  },
  top_tool_bar: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 20,
    position: "absolute",
    top: 30,
  },
  bottom_tool_bar: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 20,
    position: "absolute",
    bottom: 30
  },
  autoFocusBox: {
    position: 'absolute',
    height: 55,
    width: 55,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0ff',
    opacity: 0.4,
  },
  overlay: {
    width: "65%",
    padding: 0,
    borderRadius: 12,
  },
  action: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  security: {
    backgroundColor: BaseColor.danger
  },
  normal: {
    backgroundColor: BaseColor.mintgreen
  },
  action_icon: {
    width: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  }
});