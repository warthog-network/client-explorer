import { useState } from 'react';

export default function CopyableValue({ value, display, suffix, copiedLabel = 'copied', className = '', ...props }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
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
      className={`text-primary cursor-pointer hover:underline font-mono ${className}`}
      title="Click to copy"
      {...props}
    >
      {display || value}{suffix && ` ${suffix}`}
      {copied && <span className="text-green-400 ml-1">({copiedLabel})</span>}
    </span>
  );
}