import { SET_MODAL_STATE } from "./actionTypes";

export const setModalStateAction = ({ showModal, text, severity = "info" }) => {
  return {
    type: SET_MODAL_STATE,
    payload: {
      showModal,
      text,
      severity,
    },
  };
};
