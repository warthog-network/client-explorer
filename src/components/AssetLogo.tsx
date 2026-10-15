import { useEffect, useState } from 'react';
import { assetLogoUrl } from '../config/assetMetadata';

const WART_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

type LogoStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface AssetLogoProps {
  hash: string | null | undefined;
  name?: string | null;
  className?: string;
}

/**
 * Asset logo from the metadata service, preloaded off-screen so the real image
 * replaces the placeholder only once it has decoded. WART uses the bundled
 * ticker; anything unresolved falls back to `unknown.svg`.
 */
export default function AssetLogo({
  hash,
  name,
  className = 'h-6 w-6',
}: AssetLogoProps) {
  const [status, setStatus] = useState<LogoStatus>('idle');

  useEffect(() => {
    if (!hash || hash === 'wart' || hash === WART_HASH) {
      setStatus('error');
      return undefined;
    }
    setStatus('loading');
    const img = new Image();
    img.onload = () => setStatus('loaded');
    img.onerror = () => setStatus('error');
    img.src = assetLogoUrl(hash);
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [hash]);

  if (hash === 'wart' || hash === WART_HASH) {
    return (
      <img
        src="/warthog-ticker.svg"
        alt={name || 'WART'}
        className={`${className} rounded`}
      />
    );
  }

  if (status === 'loaded' && hash) {
    return (
      <img
        src={assetLogoUrl(hash)}
        alt={name || ''}
        className={`${className} rounded object-cover`}
      />
    );
  }

  return (
    <img
      src="/unknown.svg"
      alt=""
      className={`${className} rounded`}
    />
  );
}