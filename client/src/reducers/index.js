import { combineReducers } from "redux";
import authReducer from "./authReducer";
import modalReducer from "./modalReducer";
import dialogReducer from "./dialogReducer";

const rootReducer = combineReducers({
  authReducer,
  modalReducer,
  dialogReducer,
});

export default rootReducer;
