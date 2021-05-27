import { takeLatest } from "redux-saga/effects";
import { SETUP_INITIAL_PROFILE } from "../actions/actionTypes";
import { handleSetupProfile } from "./handlers/handleSetupProfile";

export function* watcherSaga() {
  yield takeLatest(SETUP_INITIAL_PROFILE, handleSetupProfile);
}
