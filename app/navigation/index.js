import InitProfile from "@screens/InitProfile";
import IntroductionVideo from "@screens/IntroductionVideo";
import InviteFriends from "@screens/InviteFriends";
import Loading from "@screens/Loading";
import Login from "@screens/Login";
import Verification from "@screens/Verification";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import Main from "./main";

const AppNavigator = createSwitchNavigator(
  {
    Loading: Loading,
    Login: Login,
    Verification: Verification,
    InitProfile: InitProfile,
    IntroductionVideo: IntroductionVideo,
    InviteFriends: InviteFriends,
    Main: Main,
  },
  {
    initialRouteName: "Loading"
  }
);

export default createAppContainer(AppNavigator);
