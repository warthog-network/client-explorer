import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NodeProvider } from './context/NodeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Block from './pages/Block';
import Transaction from './pages/Transaction';
import Account from './pages/Account';
import Mempool from './pages/Mempool';
import Assets from './pages/Assets';
import Asset from './pages/Asset';

export default function App() {
  return (
    <NodeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/block/:id" element={<Block />} />
            <Route path="/tx/:txid" element={<Transaction />} />
            <Route path="/address/:address" element={<Account />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/asset/:id" element={<Asset />} />
            <Route path="/mempool" element={<Mempool />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </NodeProvider>
  );
}