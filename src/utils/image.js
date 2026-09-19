// Resolves stored media URLs for display.
// Absolute links (https://...) and data/blob URIs pass through unchanged.
// Relative paths that point at /uploads/ are resolved against the API origin
// so uploaded photos keep working when the frontend and the API are hosted on
// different domains (e.g. naholdentalcare.com.bd + serv.naholdentalcare.com.bd).

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
const API_ORIGIN = API_URL.startsWith('http') ? new URL(API_URL).origin : '';

export const resolveImg = (url, fallback = '') => {
  if (!url) return fallback;
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith('data:')) return url;
  if (url.startsWith('blob:')) return url;
  const clean = url.startsWith('/') ? url : `/${url}`;
  if (clean.startsWith('/uploads/')) return `${API_ORIGIN}${clean}`;
  return clean;
};