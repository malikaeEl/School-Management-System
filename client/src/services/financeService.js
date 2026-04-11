import axios from 'axios';

const API_URL = '/api';

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
  
  updateTransactionStatus: async (transactionId, status) => {
    const res = await axios.put(`${API_URL}/finance/transactions/${transactionId}/status`, { status }, { headers: getAuthHeader() });
    return res.data;
  },

  updateTransaction: async (id, data) => {
    const res = await axios.put(`${API_URL}/finance/transactions/${id}`, data, { headers: getAuthHeader() });
    return res.data;
  },

  deleteTransaction: async (id) => {
    const res = await axios.delete(`${API_URL}/finance/transactions/${id}`, { headers: getAuthHeader() });
    return res.data;
  },
  
  getMyTransactions: async () => {
    const res = await axios.get(`${API_URL}/finance/my-transactions`, { headers: getAuthHeader() });
    return res.data;
  },

  getUserTransactions: async (userId) => {
    const res = await axios.get(`${API_URL}/finance/user-transactions/${userId}`, { headers: getAuthHeader() });
    return res.data;
  },
};

export default financeService;
