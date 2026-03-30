import axios from 'axios';

const API_URL = 'http://localhost:5000/api/inventory';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const inventoryService = {
  getAll: async (params = {}) => {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader(),
      params
    });
    return response.data;
  },

  addItem: async (itemData) => {
    const response = await axios.post(API_URL, itemData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateItem: async (id, itemData) => {
    const response = await axios.put(`${API_URL}/${id}`, itemData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  removeItem: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};

export default inventoryService;
