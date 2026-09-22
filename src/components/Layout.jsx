import { Link, useLocation } from 'react-router-dom';
import { FaLink, FaCube, FaExchangeAlt, FaUser, FaList, FaCoins, FaHeart } from 'react-icons/fa';
import NodeSelector from './NodeSelector';
import { WalletButton } from '../wallet-sdk';

const navItems = [
  { path: '/', label: 'Chain', icon: FaLink },
  { path: '/mempool', label: 'Mempool', icon: FaList },
  { path: '/assets', label: 'Assets', icon: FaCoins },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-28">
            <Link to="/" className="flex items-center gap-3">
              <img src="/warthog-logo.png" alt="Warthog Network" className="h-20 w-auto" />
              <h1 className="text-2xl font-bold text-primary hidden sm:block">Testnet Explorer</h1>
            </Link>
            <div className="flex items-center gap-4">
              <WalletButton />
              <NodeSelector />
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-px ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-white/50 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      <footer className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-white/40 flex items-center justify-center gap-1">
          Made with <FaHeart size={12} className="text-red-400" /> by AI
        </div>
      </footer>
    </div>
  );
}