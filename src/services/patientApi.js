import { api } from './api.js';

export const patientApi = {
  list: (params) => api.get('/patients', params),
  search: (params) => api.get('/patients/search', params),
  get: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  remove: (id) => api.delete(`/patients/${id}`),
};