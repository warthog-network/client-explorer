import type { NodeAssetDetail, NodeMarketDetails, NodeRichlistResult } from './node';

/**
 * What `TokenLayout` hands to its tab routes through `<Outlet context>`.
 * Shared by AssetTab, LiquidityTab and OrdersTab, all of which are rendered
 * as outlets beneath it.
 */
export interface AssetOutletContext {
  asset: NodeAssetDetail;
  hash?: string;
  richlist?: NodeRichlistResult | null;
  liquidityRichlist?: NodeRichlistResult | null;
  market?: NodeMarketDetails | null;
  /** `demo` routes through the bundled browser node, `live` through the API. */
  mode: 'demo' | 'live';
}