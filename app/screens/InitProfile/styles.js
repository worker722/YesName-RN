import { BaseColor } from "@config";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 80
  },
  center:{
    justifyContent:"center",
    alignItems:"center",
  },
  name_input: {
    color: BaseColor.whiteColor,
    textAlign: "left",
    width: "100%",
    borderBottomColor: BaseColor.whiteColor,
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginTop:20
  },
  form_button: {
    marginTop: 60,
    backgroundColor: BaseColor.primaryColor,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  avatar: {
    width: 80,
    height: 80,
  },
  sheet_item: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderBottomColor: BaseColor.grayColor,
    borderBottomWidth: .4,
  },
  gallery_item: {
    backgroundColor: BaseColor.darkPrimaryColor,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    width:55,
    height:55,
    borderRadius:1000
  }
});
