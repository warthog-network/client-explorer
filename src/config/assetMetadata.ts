export const ASSET_METADATA_HOST = 'https://testnet-assets.warthog.network';

export const assetInfoUrl = (hash: string): string => `${ASSET_METADATA_HOST}/assets/${hash}/info.json`;
export const assetLogoUrl = (hash: string): string => `${ASSET_METADATA_HOST}/assets/${hash}/logo.png`;
export const assetBannerUrl = (hash: string): string => `${ASSET_METADATA_HOST}/assets/${hash}/banner.png`;
export const assetSubmitUrl = (): string => `${ASSET_METADATA_HOST}/`;