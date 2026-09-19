import { api } from './api.js';

export const appointmentApi = {
  publicBook: (data) => api.post('/appointments/public/book', data),
  getSlots: (doctorId, date, chamberId) => api.get('/appointments/public/slots', { doctorId, date, chamberId }),
  list: (params) => api.get('/appointments', params),
  get: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  remove: (id) => api.delete(`/appointments/${id}`),
  changeStatus: (id, data) => api.patch(`/appointments/${id}/status`, data),
};