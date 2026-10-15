import type { IconType } from 'react-icons';
import { FaGlobe, FaTelegram, FaDiscord, FaXTwitter, FaCircleInfo, FaCircleExclamation } from 'react-icons/fa6';
import { assetSubmitUrl } from '../config/assetMetadata';
import type { AssetInfo, AssetInfoStatus } from '../hooks/useAssetInfo';

const SOCIAL_KEYS: Array<{ key: string; label: string; Icon: IconType }> = [
  { key: 'website', label: 'Website', Icon: FaGlobe },
  { key: 'telegram', label: 'Telegram', Icon: FaTelegram },
  { key: 'discord', label: 'Discord', Icon: FaDiscord },
  { key: 'twitter', label: 'X', Icon: FaXTwitter },
];

interface AssetSocialLinksProps {
  info: AssetInfo | null;
  loading: boolean;
  /**
   * Optional because TokenLayout does not pass it. The component already
   * treats a missing status as "nothing to show".
   */
  status?: AssetInfoStatus;
}

/**
 * Social links from asset metadata, with an explicit state for each failure
 * mode so the user can tell "no links" from "metadata service unreachable".
 */
export default function AssetSocialLinks({ info, loading, status }: AssetSocialLinksProps) {
  if (loading || status === 'idle' || !status) return null;

  if (status === 'error') {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs text-white/40"
        title="Metadata could not be loaded — check your connection to the metadata service"
      >
        <FaCircleExclamation />
        <span>Metadata unavailable</span>
      </span>
    );
  }

  if (status === 'not_found') {
    return (
      <a
        href={assetSubmitUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-primary transition-colors"
      >
        <FaCircleInfo />
        <span>No metadata submitted</span>
      </a>
    );
  }

  if (status === 'success' && info) {
    const present = SOCIAL_KEYS.filter(
      ({ key }) => typeof info[key] === 'string' && info[key] !== '',
    );
    if (present.length === 0) {
      return (
        <a
          href={assetSubmitUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-primary transition-colors"
        >
          <FaCircleInfo />
          <span>No social links</span>
        </a>
      );
    }
    return (
      <div className="flex items-center gap-3 flex-wrap">
        {present.map(({ key, label, Icon }) => (
          <a
            key={key}
            href={String(info[key])}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            title={label}
          >
            <Icon />
            <span>{label}</span>
          </a>
        ))}
      </div>
    );
  }

  return null;
}