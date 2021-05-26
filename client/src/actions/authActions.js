import axios from "../utility/axios/apiInstance";
import { LOGGED_IN, LOGOUT, SETUP_PROFILE } from "./actionTypes";
import store from "../store";

export const loginAdminAction = (token, profile) => {
  localStorage.setItem("authToken", token);
  return {
    type: SETUP_PROFILE,
    payload: {
      profile,
      as: "admin",
    },
  };
};

export const loginAction = (token, profile, as) => {
  console.log('login axtion')
  localStorage.setItem("authToken", token);
  return {
    type: LOGGED_IN,
    payload: {
      profile,
      as,
    },
  };
};

export const logoutAction = (data) => {
  return {
    type: LOGOUT,
  };
};

export const setInitialSession = (token) => {
  return async (dispatch) => {
    return getUserProfileByToken(token).then(({ profile, as, error }) => {
      if (error) {
        dispatch({
          type: LOGOUT,
        });
      }
      if (profile && as) {
        dispatch({
          type: SETUP_PROFILE,
          payload: {
            profile,
            as,
          },
        });
      }
    });
  };
};

const getUserProfileByToken = (token) => {
  return axios
    .get("/profile", { headers: { Authorization: token } })
    .then((resp) => {
      return resp.data;
    })
    .catch((error) => {
      console.log("error: ", error);
      return { error: "Something went wrong!" };
    });
};

export const setupAuthentication = async () => {
  let token = localStorage.getItem("authToken");
  if (token) {
    await store.dispatch(setInitialSession(token));
  }
};
