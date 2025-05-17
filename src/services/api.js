import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth to every request
api.interceptors.request.use((config) => {
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  
  if (username && password) {
    config.auth = {
      username,
      password
    };
  }
  
  return config;
});

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
};

export const billService = {
  generate: (customerName, customerPhone, items) => 
    api.post('/bills/generate', items, {
      params: { customerName, customerPhone },
      responseType: 'blob'
    }),
  getAll: async () => {
    try {
      const response = await api.get('/bills');
      return { data: Array.isArray(response.data) ? response.data : [], error: null };
    } catch (error) {
      return { data: [], error: error.response?.data?.message || 'Failed to fetch bills' };
    }
  },
  getByCustomerPhone: async (phone) => {
    try {
      const response = await api.get(`/bills/customer?phone=${phone}`);
      return { data: Array.isArray(response.data) ? response.data : [], error: null };
    } catch (error) {
      return { data: [], error: error.response?.data?.message || 'Failed to fetch bills by phone' };
    }
  },
  getByInvoiceNumber: async (invoiceNumber) => {
    try {
      const response = await api.get(`/bills/invoice/${invoiceNumber}`);
      return { data: response.data ? [response.data] : [], error: null };
    } catch (error) {
      return { data: [], error: error.response?.data?.message || 'Bill not found' };
    }
  },
  getByDate: async (date) => {
    try {
      const response = await api.get(`/bills/date/${date}`);
      return { data: Array.isArray(response.data) ? response.data : [], error: null };
    } catch (error) {
      return { data: [], error: error.response?.data?.message || 'Failed to fetch bills by date' };
    }
  }
};

export default api;