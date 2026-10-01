import { api } from './api.js';

export const invoiceApi = {
  list: (params) => api.get('/billing/invoices', params),
  get: (id) => api.get(`/billing/invoices/${id}`),
  create: (data) => api.post('/billing/invoices', data),
  update: (id, data) => api.put(`/billing/invoices/${id}`, data),
  remove: (id) => api.delete(`/billing/invoices/${id}`),
};

export const paymentApi = {
  list: (params) => api.get('/billing/payments', params),
  create: (data) => api.post('/billing/payments', data),
};

export const treatmentApi = {
  list: (params) => api.get('/treatments', params),
  get: (id) => api.get(`/treatments/${id}`),
  create: (data) => api.post('/treatments', data),
  update: (id, data) => api.put(`/treatments/${id}`, data),
  remove: (id) => api.delete(`/treatments/${id}`),
};

export const dentalChartApi = {
  get: (patientId) => api.get(`/dental-chart/patient/${patientId}`),
  init: (patientId) => api.post(`/dental-chart/patient/${patientId}/init`, {}),
  updateTooth: (patientId, data) => api.post(`/dental-chart/patient/${patientId}/tooth`, data),
  bulk: (data) => api.post(`/dental-chart/patient/${data.patientId}/bulk`, data),
};

export const prescriptionApi = {
  list: (params) => api.get('/prescriptions', params),
  get: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  remove: (id) => api.delete(`/prescriptions/${id}`),
  // Public: backs the QR code printed on the prescription pad.
  verify: (code) => api.get(`/prescriptions/verify/${encodeURIComponent(String(code || '').trim().toUpperCase())}`),
};

export const prescriptionVerifyUrl = (code) =>
  `${window.location.origin}/verify-prescription?code=${encodeURIComponent(String(code || '').trim().toUpperCase())}`;
