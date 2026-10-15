import { useState } from 'react';
import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';

interface CopyableValueProps extends HTMLAttributes<HTMLSpanElement> {
  value: string | number | null | undefined;
  /** Rendered in place of `value`. Falls back to `value` when absent. */
  display?: ReactNode;
  suffix?: ReactNode;
  copiedLabel?: string;
}

/** Click-to-copy span. Extra props are spread onto the span, so they win. */
export default function CopyableValue({
  value,
  display,
  suffix,
  copiedLabel = 'copied',
  className = '',
  ...props
}: CopyableValueProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value?.toString() || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <span
      onClick={handleCopy}
      className={`cursor-pointer hover:underline text-white font-mono ${className}`}
      title="Click to copy"
      {...props}
    >
      {display || value}{suffix && ` ${suffix}`}
      {copied && <span className="text-green-400 ml-1">({copiedLabel})</span>}
    </span>
  );
}