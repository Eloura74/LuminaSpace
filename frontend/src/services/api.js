import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = {
  generateImage: async (formData) => {
    const response = await axios.post(`${API_URL}/generate`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  detectObjects: async (formData) => {
    const response = await axios.post(`${API_URL}/detect`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  fetchGallery: async () => {
    const response = await axios.get(`${API_URL}/gallery`);
    return response.data;
  },

  inpaintImage: async (formData) => {
    const response = await axios.post(`${API_URL}/inpaint`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // --- Auth ---
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post(`${API_URL}/token`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // --- Products ---
  getProducts: async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },

  addProduct: async (formData) => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.post(`${API_URL}/products`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });
    return response.data;
  },

  deleteProduct: async (id) => {
    const token = localStorage.getItem('admin_token');
    const response = await axios.delete(`${API_URL}/products/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
  }
};
