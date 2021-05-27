import { call, put } from "redux-saga/effects";
import { loginAction, logoutAction } from "../../actions/authActions";
import { getUserProfileByToken } from "../../utility/utilityFunctions/apiCalls";

export function* handleSetupProfile(action) {
  try {
    const token = localStorage.getItem("authToken");
    const response = yield call(getUserProfileByToken);
    const {
      data: { profile, as, error },
    } = response;
    if (error) throw new Error();
    yield put(loginAction(token, profile, as));
  } catch (error) {
    console.log("[error log]: ", error);
    yield put(logoutAction());
  }
}
