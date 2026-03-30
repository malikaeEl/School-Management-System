import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const notificationService = {
  getAll: async () => {
    const res = await axios.get(API_URL, { headers: getAuthHeader() });
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await axios.put(`${API_URL}/${id}/read`, {}, { headers: getAuthHeader() });
    return res.data;
  },

  delete: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    return res.data;
  }
};

export default notificationService;
