import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const analyticsService = {
  getAnalytics: async () => {
    const res = await axios.get(`${API_URL}/analytics`, { headers: getAuthHeader() });
    return res.data;
  },

  updateAnalytics: async (data) => {
    const res = await axios.put(`${API_URL}/analytics`, data, { headers: getAuthHeader() });
    return res.data;
  }
};

export default analyticsService;
