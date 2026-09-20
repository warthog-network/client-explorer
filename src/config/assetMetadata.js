export const ASSET_METADATA_HOST = 'https://testnet-assets.warthog.network';

export const assetInfoUrl = (hash) => `${ASSET_METADATA_HOST}/assets/${hash}/info.json`;
export const assetLogoUrl = (hash) => `${ASSET_METADATA_HOST}/assets/${hash}/logo.png`;
export const assetBannerUrl = (hash) => `${ASSET_METADATA_HOST}/assets/${hash}/banner.png`;
export const assetSubmitUrl = () => `${ASSET_METADATA_HOST}/`;
