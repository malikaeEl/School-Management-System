import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/messages`;

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const messageService = {
  getConversations: async () => {
    const res = await axios.get(`${API_URL}/conversations`, { headers: getAuthHeader() });
    return res.data;
  },

  getMessages: async (otherUserId) => {
    const res = await axios.get(`${API_URL}/${otherUserId}`, { headers: getAuthHeader() });
    return res.data;
  },

  sendMessage: async (receiverId, content) => {
    const res = await axios.post(API_URL, { receiverId, content }, { headers: getAuthHeader() });
    return res.data;
  }
};

export default messageService;
