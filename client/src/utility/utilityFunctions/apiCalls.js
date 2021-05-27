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

export const getUsers = async ({ order, orderBy, limit, skip }) => {
  setConfigs();
  return axios.get(
    `/users/?order=${order}&orderBy=${orderBy}&limit=${limit}&skip=${skip}`,
    configs
  );
};

export const getUserRoles = async () => {
  setConfigs();
  return axios.get(`/users/roles`, configs);
};

export const inviteUser = async (email, role) => {
  setConfigs();
  return axios.post(`/users/invite`, { email, role }, configs);
};

export const resendInvite = async (email) => {
  setConfigs();
  return axios.post(`/users/resend`, { email }, configs);
};

export const deleteUsers = async (users) => {
  setConfigs();
  return axios.post(`/users/delete`, { users }, configs);
};

export const getUserProfileByToken = () => {
  setConfigs();
  return axios.get("/profile", configs);
};
