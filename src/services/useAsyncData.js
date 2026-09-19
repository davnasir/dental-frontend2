import { useState, useEffect } from 'react';

// Fetch data from the API with a graceful fallback to local static data.
// Usage: useAsyncData(fetcher, fallbackData, deps)
export function useAsyncData(fetcher, fallbackData = [], deps = []) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (cancelled) return;
        setData((prev) => {
          const next = result === undefined ? prev : result;
          const isEmptyResult = Array.isArray(next) && next.length === 0;
          const hasFallback = Array.isArray(fallbackData) && fallbackData.length > 0;
          // Keep the rich demo fallback when the API just has no data yet so
          // sections never silently turn blank.
          return isEmptyResult && hasFallback ? fallbackData : next;
        });
      })
      .catch((err) => {
        if (cancelled) return;
        // Fall back to local data but surface the error state.
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, setData };
}