import {
  SET_MODAL_STATE,
  CLOSE_MODAL,
  SET_STATIC_MODAL,
} from "../actions/actionTypes";

const initialState = {
  showModal: false,
  text: "",
  severity: "",
  showStaticModal: false,
  staticModalText: "",
};

const modalReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MODAL_STATE: {
      const { showModal, text, severity = "warning" } = action.payload;
      return {
        ...state,
        showModal,
        text,
        severity,
      };
    }
    case SET_STATIC_MODAL: {
      const { showStaticModal, text: staticModalText } = action.payload;
      return {
        ...state,
        showStaticModal,
        staticModalText,
      };
    }

    case CLOSE_MODAL: {
      return initialState;
    }
    default:
      return state;
  }
};

export default modalReducer;
