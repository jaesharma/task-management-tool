import {
  LOGGED_IN,
  LOGOUT,
  SETUP_INITIAL_PROFILE,
  SETUP_PROFILE,
} from "./actionTypes";

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
  return {
    type: SETUP_INITIAL_PROFILE,
    payload: {
      token,
    },
  };
};
