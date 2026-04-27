import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCube, FaExchangeAlt, FaUser, FaList, FaCoins } from 'react-icons/fa';
import NodeSelector from './NodeSelector';

const navItems = [
  { path: '/', label: 'Dashboard', icon: FaHome },
  { path: '/mempool', label: 'Mempool', icon: FaList },
  { path: '/assets', label: 'Assets', icon: FaCoins },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-lg">W</span>
                </div>
                <h1 className="text-xl font-bold text-primary hidden sm:block">Warthog Explorer</h1>
              </Link>
              <nav className="flex gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-black'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <NodeSelector />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      <footer className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-white/40">
          Warthog Blockchain Explorer
        </div>
      </footer>
    </div>
  );
}