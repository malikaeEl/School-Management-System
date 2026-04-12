import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || `${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')}/api`}`;

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const subjectService = {
  getAll: async () => {
    const res = await axios.get(`${API_URL}/subjects`, { headers: getAuthHeader() });
    return res.data;
  },

  create: async (subjectData) => {
    const res = await axios.post(`${API_URL}/subjects`, subjectData, { headers: getAuthHeader() });
    return res.data;
  },

  update: async (id, subjectData) => {
    const res = await axios.put(`${API_URL}/subjects/${id}`, subjectData, { headers: getAuthHeader() });
    return res.data;
  },

  remove: async (id) => {
    const res = await axios.delete(`${API_URL}/subjects/${id}`, { headers: getAuthHeader() });
    return res.data;
  },

  uploadMaterial: async (subjectId, file) => {
    const formData = new FormData();
    formData.append('document', file);
    const res = await axios.post(`${API_URL}/subjects/${subjectId}/materials`, formData, {
      headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  deleteMaterial: async (subjectId, materialId) => {
    const res = await axios.delete(`${API_URL}/subjects/${subjectId}/materials/${materialId}`, { headers: getAuthHeader() });
    return res.data;
  },
};

export default subjectService;
