import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 350,
    height: 100,
  },
  topContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: -120
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-start",
    // alignItems: "center",
    padding: 20,
    width: "100%"
  },
  phone: {
    backgroundColor: BaseColor.whiteColor,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 20,
    borderRadius: 1000
  },
  phone_text: {
    fontSize: 18
  },
  send_again: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80
  }
});
