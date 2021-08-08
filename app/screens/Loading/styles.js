import { getDeviceWidth } from "@utils";
import { StyleSheet } from "react-native";
const logoWidth = getDeviceWidth() * .7;
export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: logoWidth,
    height: 200,
  },
  loading: {
    position: "absolute",
    top: 160,
    bottom: 0,
  }
});
