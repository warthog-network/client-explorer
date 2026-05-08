import rawTags from '../../config/addressTags.json';

const HEX_REGEX = /^[0-9a-f]{48}$/i;

function validateAndNormalize(rawTags) {
  const tags = {};
  const errors = [];

  for (const [key, value] of Object.entries(rawTags)) {
    const lowerKey = key.toLowerCase();

    if (!HEX_REGEX.test(lowerKey)) {
      errors.push(`Invalid address key: "${key}" - must be 48 hex characters`);
      continue;
    }

    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`Invalid tag for address "${lowerKey}" - must be a non-empty string`);
      continue;
    }

    tags[lowerKey] = value;
  }

  if (errors.length > 0) {
    throw new Error(`addressTags.json validation failed:\n${errors.join('\n')}`);
  }

  return tags;
}

export const ADDRESS_TAGS = validateAndNormalize(rawTags);

export function getAddressTag(address) {
  if (!address) return null;
  return ADDRESS_TAGS[address.toLowerCase()] || null;
}