import { useWalletContext } from '../context/WalletContext';

function useWallet() {
  return useWalletContext();
}

export default useWallet;
