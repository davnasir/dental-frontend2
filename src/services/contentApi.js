import { api } from './api.js';

export const blogApi = {
  listPublic: (params) => api.get('/blog', params),
  getPublic: (slug) => api.get(`/blog/${slug}`),
  list: (params) => api.get('/admin/blog', params),
  create: (data) => api.post('/admin/blog', data),
  update: (id, data) => api.put(`/admin/blog/${id}`, data),
  remove: (id) => api.delete(`/admin/blog/${id}`),
};

export const reviewApi = {
  listPublic: () => api.get('/reviews'),
  submit: (data) => api.post('/reviews', data),
  list: (params) => api.get('/admin/reviews', params),
  update: (id, data) => api.put(`/admin/reviews/${id}`, data),
  approve: (id) => api.patch(`/admin/reviews/${id}/approve`, {}),
  remove: (id) => api.delete(`/admin/reviews/${id}`),
};

export const galleryApi = {
  listPublic: () => api.get('/gallery'),
  list: (params) => api.get('/admin/gallery', params),
  create: (data) => api.post('/admin/gallery', data),
  update: (id, data) => api.put(`/admin/gallery/${id}`, data),
  remove: (id) => api.delete(`/admin/gallery/${id}`),
};

export const faqApi = {
  listPublic: () => api.get('/faqs'),
  list: (params) => api.get('/admin/faqs', params),
  create: (data) => api.post('/admin/faqs', data),
  update: (id, data) => api.put(`/admin/faqs/${id}`, data),
  remove: (id) => api.delete(`/admin/faqs/${id}`),
};

export const notificationApi = {
  list: (params) => api.get('/notifications', params),
  markRead: (id) => api.patch(`/notifications/${id}/read`, {}),
  markAllRead: () => api.patch('/notifications/read-all', {}),
};

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  charts: () => api.get('/dashboard/charts'),
};

export const userApi = {
  list: (params) => api.get('/users', params),
  update: (id, data) => api.patch(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
  create: (data) => api.post('/auth/register', data),
};

export const auditApi = {
  list: (params) => api.get('/audit-logs', params),
};

export const settingsApi = {
  getPublic: (key) => api.get(`/settings/${key}`),
  list: () => api.get('/admin/settings'),
  upsert: (key, value) => api.put('/admin/settings', { key, value }),
};

// SMS gateway settings. Admin-only on the server; the API key is never
// returned, only a mask plus hasApiKey.
export const smsConfigApi = {
  get: () => api.get('/sms'),
  save: (data) => api.put('/sms', data),
  sendTest: (to, message) => api.post('/sms/test', { to, message }),
  balance: () => api.get('/sms/balance'),
};

export const categoryApi = {
  listPublic: () => api.get('/categories/public'),
  list: (params) => api.get('/categories', params),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const chamberApi = {
  listPublic: () => api.get('/chambers/public'),
  list: (params) => api.get('/chambers', params),
  get: (id) => api.get(`/chambers/${id}`),
  create: (data) => api.post('/chambers', data),
  update: (id, data) => api.put(`/chambers/${id}`, data),
  remove: (id) => api.delete(`/chambers/${id}`),
};

export const reelApi = {
  listPublic: () => api.get('/reels/public'),
  list: (params) => api.get('/reels', params),
  create: (data) => api.post('/reels', data),
  update: (id, data) => api.put(`/reels/${id}`, data),
  remove: (id) => api.delete(`/reels/${id}`),
};

export const ipBlockApi = {
  list: (params) => api.get('/ip-blocks', params),
  block: (data) => api.post('/ip-blocks', data),
  remove: (id) => api.delete(`/ip-blocks/${id}`),
};