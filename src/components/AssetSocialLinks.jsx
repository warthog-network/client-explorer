import { FaGlobe, FaTelegram, FaDiscord, FaXTwitter, FaCircleInfo } from 'react-icons/fa6';
import { assetSubmitUrl } from '../config/assetMetadata';

const SOCIAL_KEYS = [
  { key: 'website', label: 'Website', Icon: FaGlobe },
  { key: 'telegram', label: 'Telegram', Icon: FaTelegram },
  { key: 'discord', label: 'Discord', Icon: FaDiscord },
  { key: 'twitter', label: 'X', Icon: FaXTwitter },
];

export default function AssetSocialLinks({ info, loading }) {
  if (loading) return null;
  if (info) {
    const present = SOCIAL_KEYS.filter(({ key }) => info[key]);
    if (present.length === 0) {
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
    return (
      <div className="flex items-center gap-3 flex-wrap">
        {present.map(({ key, label, Icon }) => (
          <a
            key={key}
            href={info[key]}
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
