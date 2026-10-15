import { useEffect, useState } from 'react';
import { assetInfoUrl } from '../config/assetMetadata';

/**
 * Asset metadata as served by `testnet-assets.warthog.network`. The service is
 * separate from the node and its payload shape is not published in the node's
 * schema registry, so this is deliberately loose.
 */
export interface AssetInfo {
  name?: string;
  symbol?: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  [key: string]: unknown;
}

export type AssetInfoStatus = 'idle' | 'loading' | 'success' | 'not_found' | 'error';

export interface AssetInfoState {
  info: AssetInfo | null;
  loading: boolean;
  status: AssetInfoStatus;
}

/**
 * Fetch asset metadata by hash. Stays idle for `wart`, which has no metadata
 * record, and for an absent hash.
 */
export default function useAssetInfo(hash: string | null | undefined): AssetInfoState {
  const [info, setInfo] = useState<AssetInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AssetInfoStatus>('idle');

  useEffect(() => {
    if (!hash || hash === 'wart') {
      setInfo(null);
      setLoading(false);
      setStatus('idle');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setStatus('loading');

    fetch(assetInfoUrl(hash), { headers: { Accept: 'application/json' } })
      .then((res) => {
        if (cancelled) return null;
        if (res.status === 404) {
          setInfo(null);
          setStatus('not_found');
          return null;
        }
        if (!res.ok) {
          setInfo(null);
          setStatus('error');
          return null;
        }
        return res.json() as Promise<AssetInfo>;
      })
      .then((data) => {
        if (cancelled || data === null || data === undefined) return;
        setInfo(data);
        setStatus('success');
      })
      .catch(() => {
        if (cancelled) return;
        setInfo(null);
        setStatus('error');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hash]);

  return { info, loading, status };
}