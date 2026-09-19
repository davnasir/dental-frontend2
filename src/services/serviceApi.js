import { api } from './api.js';

export const serviceApi = {
  listPublic: (params) => api.get('/services/public', params),
  getPublic: (slug) => api.get(`/services/public/${slug}`),
  list: (params) => api.get('/services', params),
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/services', data, { isFormData: true });
    }
    return api.post('/services', data);
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/services/${id}`, data, { isFormData: true });
    }
    return api.put(`/services/${id}`, data);
  },
  remove: (id) => api.delete(`/services/${id}`),
  reorder: (orderedIds) => api.patch('/services/reorder', { orderedIds }),
};