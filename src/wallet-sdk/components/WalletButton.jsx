import { useState } from 'react';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import useWallet from '../hooks/useWallet';

function WalletButton() {
  const { isInstalled, isConnected, accounts, connect, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const addressToSeed = (address) => parseInt(address.slice(0, 8), 16);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (!isInstalled) {
    return (
      <a
        href="https://github.com/warthog-network/browser-wallet"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm"
      >
        Install Wallet
      </a>
    );
  }

  if (isConnected && accounts.length > 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors text-sm border border-amber-500/30">
            <Jazzicon diameter={24} seed={addressToSeed(accounts[0])} />
            {formatAddress(accounts[0])}
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-amber-500/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 rounded-lg text-sm"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

export default WalletButton;
