import { api } from './api.js';

export const uploadApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/dashboard/upload', formData, { isFormData: true });
    return res.data;
  },
};