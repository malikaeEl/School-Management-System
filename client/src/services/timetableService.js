import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || `${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')}/api`}`;

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const timetableService = {
  getAll: async (params) => {
    const res = await axios.get(`${API_URL}/timetable`, { params, headers: getAuthHeader() });
    return res.data;
  },

  addSlot: async (slotData) => {
    const res = await axios.post(`${API_URL}/timetable`, slotData, { headers: getAuthHeader() });
    return res.data;
  },

  removeSlot: async (id) => {
    const res = await axios.delete(`${API_URL}/timetable/${id}`, { headers: getAuthHeader() });
    return res.data;
  },

  updateSlot: async (id, slotData) => {
    const res = await axios.put(`${API_URL}/timetable/${id}`, slotData, { headers: getAuthHeader() });
    return res.data;
  },
};

export default timetableService;
