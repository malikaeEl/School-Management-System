import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const userService = {
  getAll: async (params = {}) => {
    const res = await axios.get(`${API_URL}/users`, { 
      headers: getAuthHeader(),
      params: params
    });
    return res.data;
  },

  getById: async (id) => {
    const res = await axios.get(`${API_URL}/users/${id}`, { headers: getAuthHeader() });
    return res.data;
  },

  create: async (userData) => {
    const res = await axios.post(`${API_URL}/users`, userData, { headers: getAuthHeader() });
    return res.data;
  },

  update: async (id, userData) => {
    const res = await axios.put(`${API_URL}/users/${id}`, userData, { headers: getAuthHeader() });
    return res.data;
  },

  remove: async (id) => {
    const res = await axios.delete(`${API_URL}/users/${id}`, { headers: getAuthHeader() });
    return res.data;
  },

  changePassword: async (data) => {
    const res = await axios.put(`${API_URL}/users/profile/password`, data, { headers: getAuthHeader() });
    return res.data;
  },
};

export default userService;
