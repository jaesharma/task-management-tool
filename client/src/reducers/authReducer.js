import {
  LOGGED_IN,
  LOGOUT,
  SETUP_PROFILE,
  UPDATE_PROJECT,
} from "../actions/actionTypes";

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
    case UPDATE_PROJECT:
      const { updatedProject } = action.payload;
      const index = state.user.projects.findIndex(
        (project) => project._id === updatedProject._id
      );
      if (index !== -1) {
        const updatedProjects = [...state.user.projects];
        updatedProjects[index] = updatedProject;
        return { ...state, user: { ...state.user, projects: updatedProjects } };
      }
      return state;
    default:
      return state;
  }
};

export default authReducer;
