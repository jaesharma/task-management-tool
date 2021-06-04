import { UPDATE_PROJECT } from "./actionTypes";

export const updateProjectAction = ({ updatedProject }) => {
  return {
    type: UPDATE_PROJECT,
    payload: {
      updatedProject,
    },
  };
};
