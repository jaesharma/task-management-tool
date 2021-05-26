import axios from "../axios/apiInstance";

let configs = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
};

const setConfigs = () => {
  configs = {
    ...configs,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  };
};

export const getUsers = async () => {
  setConfigs();
  return axios.get(`/users`, configs);
};

export const getUserRoles = async () => {
  setConfigs();
  return axios.get(`/users/roles`, configs);
};

export const inviteUser = async (email, role) => {
  setConfigs();
  return axios.post(`/users/invite`, { email, role }, configs);
};
