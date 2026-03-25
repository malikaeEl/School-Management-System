import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const libraryService = {
  getOverview: async () => {
    const res = await axios.get(`${API_URL}/library/overview`, { headers: getAuthHeader() });
    return res.data;
  },

  getBooks: async () => {
    const res = await axios.get(`${API_URL}/library/books`, { headers: getAuthHeader() });
    return res.data;
  },

  addBook: async (bookData) => {
    const res = await axios.post(`${API_URL}/library/books`, bookData, { headers: getAuthHeader() });
    return res.data;
  },

  getBorrows: async () => {
    const res = await axios.get(`${API_URL}/library/borrows`, { headers: getAuthHeader() });
    return res.data;
  },

  borrowBook: async (data) => {
    const res = await axios.post(`${API_URL}/library/borrows`, data, { headers: getAuthHeader() });
    return res.data;
  },
};

export default libraryService;
