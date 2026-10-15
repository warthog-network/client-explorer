import rawTags from '../../config/addressTags.json';

const HEX_REGEX = /^[0-9a-f]{48}$/i;

/** Lowercased 48-hex address to a human label. */
function validateAndNormalize(tags: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {};
  const errors: string[] = [];

  for (const [key, value] of Object.entries(tags)) {
    const lowerKey = key.toLowerCase();

    if (!HEX_REGEX.test(lowerKey)) {
      errors.push(`Invalid address key: "${key}" - must be 48 hex characters`);
      continue;
    }

    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`Invalid tag for address "${lowerKey}" - must be a non-empty string`);
      continue;
    }

    result[lowerKey] = value;
  }

  if (errors.length > 0) {
    throw new Error(`addressTags.json validation failed:\n${errors.join('\n')}`);
  }

  return result;
}

export const ADDRESS_TAGS: Record<string, string> = validateAndNormalize(rawTags);

export function getAddressTag(address: string | null | undefined): string | null {
  if (!address) return null;
  return ADDRESS_TAGS[address.toLowerCase()] ?? null;
}