import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NodeProvider } from './context/NodeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Block from './pages/Block';
import Transaction from './pages/Transaction';
import Account from './pages/Account';
import Mempool from './pages/Mempool';
import Tokens from './pages/Tokens';
import Token from './pages/Token';
import TokenLayout from './pages/TokenLayout';
import AssetTab from './pages/AssetTab';
import LiquidityTab from './pages/LiquidityTab';
import OrdersTab from './pages/OrdersTab';

export default function App() {
  return (
    <NodeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/block/:id" element={<Block />} />
            <Route path="/tx/:txid" element={<Transaction />} />
            <Route path="/address/:address/:tokenspec?" element={<Account />} />
            <Route path="/tokens" element={<Tokens />} />
            <Route path="/asset/wart" element={<Token />} />
            <Route path="/asset/:hash" element={<TokenLayout />}>
              <Route index element={<AssetTab />} />
              <Route path="liquidity" element={<LiquidityTab />} />
              <Route path="orders" element={<OrdersTab />} />
            </Route>
            <Route path="/mempool" element={<Mempool />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </NodeProvider>
  );
}
