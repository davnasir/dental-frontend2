export const normalizePost = (p) => {
  const category = p.categoryTitle
    ? (typeof p.categoryTitle === 'object' ? p.categoryTitle : { en: p.categoryTitle, bn: p.categoryTitle })
    : (typeof p.category === 'string' ? { en: p.category, bn: p.category } : p.category);
  return {
    ...p,
    image: p.featuredImage || p.image,
    category: category || { en: 'News', bn: 'খবর' },
    date: p.publishedAt ? String(p.publishedAt).slice(0, 10) : (p.date || ''),
    excerpt: p.excerpt && typeof p.excerpt === 'object' ? p.excerpt : { en: p.excerpt || '', bn: p.excerpt || '' },
    content: p.content && typeof p.content === 'object' ? p.content : { en: p.content || '', bn: p.content || '' },
  };
};