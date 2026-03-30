import axios from 'axios';

const API_URL = 'http://localhost:5000/api/leaves';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const leaveService = {
  getAll: async () => {
    const res = await axios.get(API_URL, { headers: getAuthHeader() });
    return res.data;
  },

  submit: async (leaveData) => {
    const res = await axios.post(API_URL, leaveData, { headers: getAuthHeader() });
    return res.data;
  },

  updateStatus: async (id, statusData) => {
    const res = await axios.put(`${API_URL}/${id}`, statusData, { headers: getAuthHeader() });
    return res.data;
  },

  remove: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    return res.data;
  }
};

export default leaveService;
