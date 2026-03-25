import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const financeService = {
  getOverview: async () => {
    const res = await axios.get(`${API_URL}/finance/overview`, { headers: getAuthHeader() });
    return res.data;
  },

  getTransactions: async () => {
    const res = await axios.get(`${API_URL}/finance/transactions`, { headers: getAuthHeader() });
    return res.data;
  },

  generateInvoice: async (invoiceData) => {
    const res = await axios.post(`${API_URL}/finance/invoice`, invoiceData, { headers: getAuthHeader() });
    return res.data;
  },

  getFees: async () => {
    const res = await axios.get(`${API_URL}/finance/fees`, { headers: getAuthHeader() });
    return res.data;
  },

  updateFees: async (id, feeData) => {
    const res = await axios.put(`${API_URL}/finance/fees/${id}`, feeData, { headers: getAuthHeader() });
    return res.data;
  },
};

export default financeService;
