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
    alignItems: "center"
  },
  flexcenter: {
    flex:1,
    justifyContent: "center",
    alignItems: "center"
  },
  create_chat: {
    position: "absolute",
    bottom: 20,
    right: 20
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: BaseColor.primaryColor,
    flex: 1,
    flexDirection: 'row',
    paddingRight: 15,
  },
});
