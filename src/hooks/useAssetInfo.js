import { useEffect, useState } from 'react';
import { assetInfoUrl } from '../config/assetMetadata';

export default function useAssetInfo(hash) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hash || hash === 'wart') {
      setInfo(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    fetch(assetInfoUrl(hash), { headers: { Accept: 'application/json' } })
      .then((res) => {
        if (cancelled) return null;
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`info.json ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setInfo(data);
      })
      .catch(() => {
        if (cancelled) return;
        setInfo(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hash]);

  return { info, loading };
}
