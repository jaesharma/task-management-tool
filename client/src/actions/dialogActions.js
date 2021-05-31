import { SET_CREATE_PROJECT_DIALOG } from "./actionTypes";

export const setCreateProjectDialogAction = (state) => {
  return {
    type: SET_CREATE_PROJECT_DIALOG,
    payload: {
      state,
    },
  };
};
