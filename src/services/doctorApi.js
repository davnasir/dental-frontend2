import { api } from './api.js';

export const doctorApi = {
  listPublic: () => api.get('/doctors/public'),
  getPublic: (id) => api.get(`/doctors/public/${id}`),
  list: (params) => api.get('/doctors', params),
  get: (id) => api.get(`/doctors/${id}`),
  create: (data) => {
    if (data instanceof FormData) return api.post('/doctors', data, { isFormData: true });
    return api.post('/doctors', data);
  },
  update: (id, data) => {
    if (data instanceof FormData) return api.put(`/doctors/${id}`, data, { isFormData: true });
    return api.put(`/doctors/${id}`, data);
  },
  remove: (id) => api.delete(`/doctors/${id}`),
  setAvailability: (id, data) => api.patch(`/doctors/${id}/availability`, data),
};