import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${BASE_URL}/dashboard`;

const getDashboardData = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const config = {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data;
};

const updateSubjectProgress = async (subjectId, progress) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const config = { headers: { Authorization: `Bearer ${user.token}` } };
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const response = await axios.put(`${BASE_URL}/subjects/${subjectId}`, { progress }, config);
  return response.data;
};

const dashboardService = {
  getDashboardData,
  updateSubjectProgress,
};

export default dashboardService;
