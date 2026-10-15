import { useWalletContext, type WalletState } from '../context/WalletContext';

function useWallet(): WalletState {
  return useWalletContext();
}

export default useWallet;