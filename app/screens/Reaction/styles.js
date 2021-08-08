import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BaseColor.blackColor
  },
  draggableView: {
    position: "absolute",
    flex: 1,
    backgroundColor: "#00000000",
    height: "100%",
    width: "100%"
  }
});
