import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BaseColor.primaryColor,
  },
  center: {
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    width: 80,
    height: 100,
    borderRadius: 8
  },
  selected_image: {
    width: 85,
    height: 110,
    borderRadius: 8,
  },
  action: {
    padding: 10,
    marginHorizontal: 5
  },
  action_bar: {
    width: "100%",
    paddingTop: 25,
    position: "absolute",
    paddingVertical: 5,
    paddingHorizontal: 15,
    top: 0,
    backgroundColor: "#00000033",
    flexDirection: "row",
  },
  bottom_list: {
    flex: 1,
    height: 150,
    width: "100%",
    paddingTop: 10,
    position: "absolute",
  },
  image: {
    width: "100%",
    flex: 1,
    alignSelf: 'center',
  },
  filterSelector: {
    width: 85,
    height: 100,
    margin: 5,
    borderRadius: 12,
  },
  filterTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
});
