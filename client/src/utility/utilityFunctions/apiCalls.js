import qs from "qs";
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

export const getUsers = async ({ order, orderBy, limit, skip, search }) => {
  setConfigs();
  return axios.get(
    `/users/?order=${order}&orderBy=${orderBy}&limit=${limit}&skip=${skip}&search=${search}`,
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

export const createUserRole = ({ title, permissions }) => {
  setConfigs();
  return axios.post("/users/role", { title, permissions }, configs);
};

export const updateRole = (id, title, permissions) => {
  setConfigs();
  return axios.patch("/users/role", { id, title, permissions }, configs);
};

export const updateUser = ({ uid, roleId }) => {
  setConfigs();
  return axios.patch(`/users/${uid}`, { roleId }, configs);
};

export const logout = () => {
  setConfigs();
  return axios.post("/logout", {}, configs);
};

export const getCsvData = ({ users, selected_roles: roles }) => {
  setConfigs();
  const params = {
    users,
    roles,
  };

  return axios.get("/users/csv", {
    ...configs,
    params,
    paramsSerializer: (params) => {
      return qs.stringify(params);
    },
  });
};

export const getProjects = () => {
  setConfigs();
  return axios.get(`/projects`, configs);
};

export const createProject = ({ title, key }) => {
  setConfigs();
  return axios.post("/projects", { title, key }, configs);
};

export const starProject = (projectId) => {
  setConfigs();
  return axios.post("/projects/star", { projectId }, configs);
};

export const getProjectById = (pid) => {
  setConfigs();
  return axios.get(`/projects/${pid}`, configs);
};

export const createColumn = ({ title, projectId }) => {
  setConfigs();
  return axios.post(`/columns/create`, { title, projectId }, configs);
};

export const createTask = ({ summary, columnId, projectId }) => {
  setConfigs();
  return axios.post(`/tasks/create`, { summary, columnId, projectId }, configs);
};
