/**
 * Shape of the object the browser-wallet extension injects as `window.warthog`.
 *
 * This is the inter-repo contract between `client-explorer` and
 * `browser-wallet`. It is transcribed from `browser-wallet/src/provider/`
 * at `84c9e55`, not generated from anything, so it is a snapshot and will
 * drift if that repo changes. Re-check it when the provider moves.
 *
 * The extension is optional: `window.warthog` is absent when the wallet is not
 * installed, which every call site has to handle.
 */

export interface WarthogProviderRequest {
  method: string;
  params?: Record<string, unknown>;
}

export type EventHandler = (...args: unknown[]) => void;
export type Unsubscribe = () => void;

export interface WarthogProvider {
  request(args: WarthogProviderRequest): Promise<unknown>;
  on(event: string, handler: EventHandler): Unsubscribe;
  removeListener(event: string, handler: EventHandler): void;
  isConnected(): boolean;
}

/**
 * Error codes the provider rejects with. Duplicated from
 * `browser-wallet/src/provider/messages.ts` (`ERRORS`), which is the same
 * table under a different name. The codes are EIP-1193 and EIP-4001 values.
 */
export const WARTHOG_ERRORS = {
  USER_REJECTED: { code: 4001, message: 'User rejected the request' },
  UNAUTHORIZED: { code: 4100, message: 'Unauthorized - please connect first' },
  CHAIN_NOT_FOUND: { code: 4900, message: 'Chain not found' },
  INTERNAL_ERROR: { code: -32603, message: 'Internal error' },
  METHOD_NOT_FOUND: { code: -32601, message: 'Method not found' },
} as const;

export type WarthogErrorCode = keyof typeof WARTHOG_ERRORS;

/**
 * Methods the provider actually handles. `openSendPage` is **not** among them:
 * `client-explorer` calls it from the account page, and the provider's `request`
 * switch has no such case, so it always rejects with `METHOD_NOT_FOUND`. Kept
 * in the type so the mismatch stays visible rather than being papered over.
 */
export type WarthogMethod =
  | 'requestAccounts'
  | 'accounts'
  | 'chainId'
  | 'disconnect'
  | 'sendTransaction'
  | 'transferWart'
  | 'openSendPage';

declare global {
  interface Window {
    warthog?: WarthogProvider;
  }
}