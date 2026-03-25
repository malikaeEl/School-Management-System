import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const authService = {
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  login: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, userData);
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getMe: async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) return null;

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    const response = await axios.get(`${API_URL}/auth/me`, config);
    return response.data;
  }
};

export default authService;
