import { useEffect, useState } from 'react';
import { assetInfoUrl } from '../config/assetMetadata';

export default function useAssetInfo(hash) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');

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
        return res.json();
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
