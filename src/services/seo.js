// Lightweight per-page SEO for the SPA. Each blog post is served as its own
// route (/blog/:slug) and gets its own title, meta description, canonical URL,
// Open Graph / Twitter cards and an Article JSON-LD block so search engines and
// social scrapers index every article as an individual page instead of a single
// collapsed SPA route.

import { resolveImg } from '../utils/image';

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://naholdentalcare.com.bd').replace(/\/+$/, '');

export const SITE_NAME = 'Nahol Dental Care';
export const BRAND_TITLE = 'Nahol Dental Care | Specialist Oral Care & Smile Transformation';
export const BRAND_DESCRIPTION =
  'Experience world-class painless dental treatments, smile design, root canal, dental implants & orthodontics at Nahol Dental Care. Book your consultation today.';

// Turns any stored image path into an absolute URL suitable for og:image /
// twitter:image (relative and /uploads/ paths are resolved like resolveImg).
export const absoluteMediaUrl = (raw, fallback = `${SITE_URL}/logo.jpg`) => {
  const img = resolveImg(raw, fallback);
  if (!img) return fallback;
  if (/^https?:\/\//.test(img)) return img;
  if (img.startsWith('/')) return `${SITE_URL}${img}`;
  return `${SITE_URL}/${img}`;
};

const ensureMeta = (attr, key) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  return el;
};

const setMeta = (attr, key, content) => {
  if (content === undefined || content === null || content === '') return;
  ensureMeta(attr, key).setAttribute('content', String(content));
};

const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const setJsonLd = (obj) => {
  const prev = document.getElementById('seo-jsonld');
  if (prev) prev.remove();
  if (!obj) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'seo-jsonld';
  script.textContent = JSON.stringify(obj);
  document.head.appendChild(script);
};

// The static tags that ship in index.html (homepage). Captured on the first
// call so navigating back to the homepage restores exactly what was there.
let defaults = null;
const captureDefaults = () => {
  if (defaults) return defaults;
  const read = (attr, key) => {
    const el = document.head.querySelector(`meta[${attr}="${key}"]`);
    return el ? el.getAttribute('content') : '';
  };
  defaults = {
    title: document.title || BRAND_TITLE,
    description: read('name', 'description') || BRAND_DESCRIPTION,
    keywords: read('name', 'keywords'),
    ogTitle: read('property', 'og:title'),
    ogDescription: read('property', 'og:description'),
    ogImage: read('property', 'og:image'),
    ogUrl: read('property', 'og:url'),
    twitterTitle: read('name', 'twitter:title'),
    twitterDescription: read('name', 'twitter:description'),
    canon: (document.head.querySelector('link[rel="canonical"]') || {}).getAttribute?.('href') || `${SITE_URL}/`,
  };
  return defaults;
};

// Inject per-page SEO tags. Anything not supplied is left untouched.
export const applySeo = ({ title, description, url, image, type = 'article', keywords = '', jsonLd } = {}) => {
  if (title) document.title = title;
  setMeta('name', 'description', description);
  setMeta('name', 'keywords', keywords);
  setMeta('property', 'og:type', type);
  setMeta('property', 'og:site_name', SITE_NAME);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:image', image ? absoluteMediaUrl(image) : undefined);
  setMeta('property', 'og:url', url);
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image ? absoluteMediaUrl(image) : undefined);
  if (url) setCanonical(url);
  setJsonLd(jsonLd);
};

// Restore the index.html defaults (used when leaving a dynamic page).
export const resetSeo = () => {
  const d = captureDefaults();
  document.title = d.title;
  ensureMeta('name', 'description').setAttribute('content', d.description);
  ensureMeta('name', 'keywords').setAttribute('content', d.keywords);
  ensureMeta('property', 'og:type').setAttribute('content', 'website');
  ensureMeta('property', 'og:site_name').setAttribute('content', SITE_NAME);
  ensureMeta('property', 'og:title').setAttribute('content', d.ogTitle);
  ensureMeta('property', 'og:description').setAttribute('content', d.ogDescription);
  ensureMeta('property', 'og:image').setAttribute('content', d.ogImage);
  ensureMeta('property', 'og:url').setAttribute('content', d.ogUrl);
  ensureMeta('name', 'twitter:card').setAttribute('content', 'summary_large_image');
  ensureMeta('name', 'twitter:title').setAttribute('content', d.twitterTitle);
  ensureMeta('name', 'twitter:description').setAttribute('content', d.twitterDescription);
  setCanonical(d.canon);
  setJsonLd(null);
};