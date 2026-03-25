import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const attendanceService = {
  getStats: async (studentId) => {
    const res = await axios.get(`${API_URL}/attendance/student/${studentId}`, { headers: getAuthHeader() });
    return res.data;
  },

  getAll: async (params) => {
    const res = await axios.get(`${API_URL}/attendance`, { params, headers: getAuthHeader() });
    return res.data;
  },

  submit: async (subjectId, students) => {
    const res = await axios.post(`${API_URL}/attendance`, { subjectId, students }, { headers: getAuthHeader() });
    return res.data;
  },
};

export default attendanceService;
