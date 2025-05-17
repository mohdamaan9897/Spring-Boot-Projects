import api from './api';

export const login = async (username, password) => {
  console.log('Attempting login with:', username); // Debug log
  try {
    const response = await api.get('/products', {
      auth: { username, password }
    });
    console.log('Login response:', response.status); // Debug log
    
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    return true;
  } catch (error) {
    console.error('Login failed:', error.response?.status, error.message); // Debug log
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('username');
  localStorage.removeItem('password');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('username');
};

export const isAdmin = () => {
  return localStorage.getItem('username') === 'admin';
};