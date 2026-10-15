import { useEffect, useState } from 'react';
import nodeApi from '../api/nodeApi';
import { demoGet } from '../wasm/demo';
import type { NodeMarketDetails } from '../types/node';

export interface OrderBookState {
  data: NodeMarketDetails | null;
  loading: boolean;
  error: string | null;
}

/**
 * Order book for an asset, from either a live node or the bundled browser node.
 *
 * `mode` is 'demo' | 'live', matching what TokenLayout puts in its outlet
 * context. Anything that is not 'demo' reads through the node API.
 */
export default function useOrderBookData(
  hash: string | null | undefined,
  mode: 'demo' | 'live',
): OrderBookState {
  const [data, setData] = useState<NodeMarketDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const fetcher: () => Promise<NodeMarketDetails> = mode === 'demo'
      ? () => demoGet<NodeMarketDetails>(`/dex/market/${hash}`)
      : () => nodeApi.getMarket(hash);

    fetcher()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load order book');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [hash, mode]);

  return { data, loading, error };
}