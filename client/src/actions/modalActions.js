import { SET_MODAL_STATE, SET_STATIC_MODAL } from "./actionTypes";

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

export const setStaticModalAction = ({ showStaticModal, text }) => {
  return {
    type: SET_STATIC_MODAL,
    payload: {
      showStaticModal,
      text,
    },
  };
};
