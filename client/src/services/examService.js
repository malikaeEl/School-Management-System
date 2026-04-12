import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || `${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')}/api`}`;

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const examService = {
  getAll: async (params) => {
    const res = await axios.get(`${API_URL}/exams`, { params, headers: getAuthHeader() });
    return res.data;
  },

  create: async (examData) => {
    const res = await axios.post(`${API_URL}/exams`, examData, { headers: getAuthHeader() });
    return res.data;
  },

  getGrades: async (examId) => {
    const res = await axios.get(`${API_URL}/exams/${examId}/grades`, { headers: getAuthHeader() });
    return res.data;
  },

  submitGrades: async (examId, marks) => {
    const res = await axios.post(`${API_URL}/exams/${examId}/grades`, { marks }, { headers: getAuthHeader() });
    return res.data;
  },
};

export default examService;
