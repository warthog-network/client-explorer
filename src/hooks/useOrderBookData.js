import { useEffect, useState } from 'react';
import nodeApi from '../api/nodeApi';
import { demoGet } from '../wasm/demo';

export default function useOrderBookData(hash, mode) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hash) {
      setData(null);
      setError(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetcher = mode === 'demo'
      ? () => demoGet(`/dex/market/${hash}`)
      : () => nodeApi.getMarket(hash);

    fetcher()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load order book');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [hash, mode]);

  return { data, loading, error };
}
