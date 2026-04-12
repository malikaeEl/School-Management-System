import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || `${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')}/api`}`;

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const admissionService = {
  // Public
  submit: async (data) => {
    const res = await axios.post(`${API_URL}/admissions/submit`, data);
    return res.data;
  },

  // Admin
  getAll: async () => {
    const res = await axios.get(`${API_URL}/admissions`, { headers: getAuthHeader() });
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await axios.put(`${API_URL}/admissions/${id}`, { status }, { headers: getAuthHeader() });
    return res.data;
  },

  remove: async (id) => {
    const res = await axios.delete(`${API_URL}/admissions/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
};

export default admissionService;
