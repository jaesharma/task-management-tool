import {
  SET_CREATE_PROJECT_DIALOG,
} from "../actions/actionTypes";

const initialState = {
  showCreateProjectDialog: false,
};

const dialogReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CREATE_PROJECT_DIALOG: {
      return {
        ...initialState,
        showCreateProjectDialog: action.payload.state,
      };
    }

    default:
      return state;
  }
};

export default dialogReducer;
