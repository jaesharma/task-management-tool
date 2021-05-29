import { LOGGED_IN, LOGOUT, SETUP_PROFILE } from "../actions/actionTypes";

const initialState = {
  isAuthenticated: false,
  as: undefined,
  user: {},
  loading: true,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGGED_IN: {
      const { profile, as } = action.payload;
      return {
        isAuthenticated: true,
        as,
        user: profile,
        loading: false,
      };
    }
    case LOGOUT: {
      localStorage.removeItem("authToken");
      return {
        ...initialState,
        loading: false,
      };
    }
    case SETUP_PROFILE: {
      const { as, profile } = action.payload;
      return {
        isAuthenticated: true,
        as,
        user: profile,
        loading: false,
      };
    }
    default:
      return state;
  }
};

export default authReducer;
