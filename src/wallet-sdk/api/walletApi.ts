import {
  WARTHOG_ERRORS,
  type EventHandler,
  type Unsubscribe,
  type WarthogProvider,
} from '../../types/wallet';

export { WARTHOG_ERRORS };

export function getProvider(): WarthogProvider | undefined {
  return window.warthog;
}

export function isWalletConnected(): boolean {
  const provider = getProvider();
  return provider?.isConnected() ?? false;
}

/** Prompts the user to approve the connection. Resolves to the account list. */
export async function requestAccounts(): Promise<string[]> {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Warthog wallet not installed');
  }
  return provider.request({ method: 'requestAccounts' }) as Promise<string[]>;
}

/** Currently connected accounts, or `[]` when no wallet is installed. */
export async function getAccounts(): Promise<string[]> {
  const provider = getProvider();
  if (!provider) {
    return [];
  }
  return provider.request({ method: 'accounts' }) as Promise<string[]>;
}

export async function getChainId(): Promise<string | null> {
  const provider = getProvider();
  if (!provider) {
    return null;
  }
  return provider.request({ method: 'chainId' }) as Promise<string>;
}

/**
 * Send WART. The provider resolves to the transaction hash as a bare string,
 * not to a `{txHash}` object, despite what its `SendTransactionResult`
 * interface suggests.
 */
export async function transferWart(to: string, amount: string): Promise<string> {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Warthog wallet not installed');
  }
  return provider.request({
    method: 'transferWart',
    params: { to, amount },
  }) as Promise<string>;
}

export async function sendTransaction(to: string, amount: string): Promise<string> {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Warthog wallet not installed');
  }
  return provider.request({
    method: 'sendTransaction',
    params: { to, amount },
  }) as Promise<string>;
}

/**
 * Ask the wallet to open its send view for `to`.
 *
 * The provider has no `openSendPage` case, so this always rejects with
 * `METHOD_NOT_FOUND` against `browser-wallet@84c9e55`. See `types/wallet.ts`.
 */
export async function openSendPage(to: string): Promise<unknown> {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Warthog wallet not installed');
  }
  return provider.request({
    method: 'openSendPage',
    params: { to },
  });
}

export function onAccountsChanged(callback: EventHandler): Unsubscribe {
  const provider = getProvider();
  if (!provider) {
    return () => {};
  }
  return provider.on('accountsChanged', callback);
}

export function onChainChanged(callback: EventHandler): Unsubscribe {
  const provider = getProvider();
  if (!provider) {
    return () => {};
  }
  return provider.on('chainChanged', callback);
}

export async function disconnect(): Promise<void> {
  const provider = getProvider();
  if (!provider) {
    return;
  }
  await provider.request({ method: 'disconnect' });
}