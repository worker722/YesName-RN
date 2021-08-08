import { combineReducers } from "redux";
import app from "./app";
import auth from "./auth";
import call from "./call";
import chat from "./chat";
import status from "./status";
import stories from "./story";
import users from "./users";

export default combineReducers({
  auth,
  status,
  users,
  stories,
  app,
  chat,
  call
});
