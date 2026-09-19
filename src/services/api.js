// Reusable API client for the dental clinic frontend.
// Handles loading, success, empty, error, unauthorized, and network failure states.

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

let accessToken = null;
let onUnauthorized = null;

export const setAuthToken = (token) => {
  accessToken = token;
};

export const setOnUnauthorized = (cb) => {
  onUnauthorized = cb;
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const getToken = () => accessToken;

const buildUrl = (path) => {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${clean}`;
};

const getHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
};

async function request(method, path, { body, params, headers: extraHeaders, isFormData } = {}) {
  let url = buildUrl(path);
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `${url.includes('?') ? '&' : '?'}${qs}`;
  }

  const config = {
    method,
    headers: { ...getHeaders(isFormData), ...(extraHeaders || {}) },
    credentials: 'include',
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new ApiError('Network error. Please check your connection.', 0, null);
  }

  let json = null;
  try {
    json = await response.json();
  } catch (err) {
    json = null;
  }

  if (response.status === 401 && !/^\/auth\//.test(path)) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const retryConfig = {
        ...config,
        headers: { ...getHeaders(isFormData), ...(extraHeaders || {}) },
      };
      let retried;
      try {
        retried = await fetch(url, retryConfig);
      } catch (err) {
        throw new ApiError('Network error. Please check your connection.', 0, null);
      }
      let retryJson = null;
      try {
        retryJson = await retried.json();
      } catch (err) {
        retryJson = null;
      }
      if (retried.ok) return retryJson;
      json = retryJson;
      response = retried;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && typeof onUnauthorized === 'function') {
      onUnauthorized();
    }
    throw new ApiError(
      json?.message || 'Something went wrong',
      response.status,
      json
    );
  }

  return json;
}

let refreshing = null;
async function tryRefresh() {
  if (refreshing === null) {
    refreshing = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) return false;
        if (data?.data?.accessToken) setAuthToken(data.data.accessToken);
        return true;
      } catch (err) {
        return false;
      }
    })();
  }
  try {
    return await refreshing;
  } finally {
    refreshing = null;
  }
}

export const api = {
  get: (path, params, opts) => request('GET', path, { params, ...opts }),
  post: (path, body, opts) => request('POST', path, { body, ...opts }),
  put: (path, body, opts) => request('PUT', path, { body, ...opts }),
  patch: (path, body, opts) => request('PATCH', path, { body, ...opts }),
  delete: (path, opts) => request('DELETE', path, { ...opts }),
};

export const handleApi = {
  // Run an async operation, returning [error, data]. Handles ApiError vs network.
  async run(fn) {
    try {
      const data = await fn();
      return [null, data];
    } catch (err) {
      if (err instanceof ApiError) {
        return [err, null];
      }
      return [new ApiError(err.message || 'Unexpected error', 0, null), null];
    }
  },
};