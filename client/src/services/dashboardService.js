import axios from 'axios';

const API_URL = 'http://localhost:5000/api/dashboard';

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
  const response = await axios.put(`http://localhost:5000/api/subjects/${subjectId}`, { progress }, config);
  return response.data;
};

const dashboardService = {
  getDashboardData,
  updateSubjectProgress,
};

export default dashboardService;
