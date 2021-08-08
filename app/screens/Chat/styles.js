import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BaseColor.primaryColor
  },
  contain: {
    flex: 1,
    width: "100%"
  },
  center: {
    justifyContent: "center",
    alignItems: "center"
  },
  create_chat: {
    position: "absolute",
    bottom: 20,
    right: 20
  },
  dateline: {
    borderBottomColor: BaseColor.grayColor,
    borderBottomWidth: 1,
    alignItems: "center",
    marginBottom: 8
  },
  date: {
    backgroundColor: BaseColor.primaryColor,
    marginBottom: -8,
    paddingHorizontal: 8,
    fontSize: 14
  }
});
