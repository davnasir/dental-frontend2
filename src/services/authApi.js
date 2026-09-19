import { api, setAuthToken, setOnUnauthorized, handleApi } from './api.js';

export const authApi = {
  async login(email, password) {
    const [err, res] = await handleApi.run(() =>
      api.post('/auth/login', { email, password })
    );
    if (!err && res?.data?.accessToken) setAuthToken(res.data.accessToken);
    return [err, res];
  },

  async logout() {
    const [err, res] = await handleApi.run(() => api.post('/auth/logout', {}));
    setAuthToken(null);
    return [err, res];
  },

  async refresh() {
    const res = await api.post('/auth/refresh', {});
    if (res?.data?.accessToken) setAuthToken(res.data.accessToken);
    return res;
  },

  async getMe() {
    return api.get('/auth/me');
  },

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token, password) {
    return api.post('/auth/reset-password', { token, password });
  },

  async changePassword(currentPassword, newPassword) {
    return api.post('/auth/change-password', { currentPassword, newPassword });
  },

  initSession({ onUnauthorized }) {
    setOnUnauthorized(onUnauthorized || (() => {}));
  },
};