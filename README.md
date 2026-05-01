# Warthog Client Explorer

A lightweight blockchain explorer for the Warthog network. Runs entirely in the browser with no server-side components.

## Quick Start

### 1. Start the Node

Ensure your Warthog node ([defi branch](https://github.com/warthog-network/core/tree/defi)) is running with RPC enabled:

```bash
./wart-node --isolated --minfee=0.00000001 --testnet --enable-trades-historydb
```

### 2. Start the CORS Proxy

Since browsers block cross-origin requests, run the included CORS proxy:

```bash
node cors-proxy.js
```

By default, the proxy:
- Listens on `localhost:3101`
- Forwards requests to `localhost:3100`

**Environment variables:**
```bash
TARGET_HOST=192.168.1.100:3100 PROXY_PORT=3101 node cors-proxy.js
```

### 3. Start the Explorer

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Configure the Node

In the explorer's top-right dropdown, select your node URL:
- For local testing: `localhost:3101` (proxy)
- For direct connection (if CORS is enabled on node): `localhost:3100`

## Features

- **Dashboard**: Chain head info, hashrate chart, recent blocks
- **Block Explorer**: Search by block height or hash, view all transactions
- **Transaction Lookup**: Search by txid, detailed view for all transaction types
- **Account View**: WART balance (total/locked/mempool), transaction history
- **Mempool**: Live view of pending transactions

### Supported Transaction Types

| Type | Description |
|------|-------------|
| `wartTransfer` | WART coin transfer |
| `tokenTransfer` | Non-WART token transfer |
| `assetCreation` | Create new asset |
| `cancelation` | Cancel pending transaction/order |
| `liquidityDeposit` | Deposit to liquidity pool |
| `liquidityWithdrawal` | Withdraw from pool |
| `limitSwap` | DEX limit order |
| `reward` | Block reward |
| `match` | DEX batch match |

## Search

Use the search bar to find:
- **Blocks**: Enter a block number (e.g., `123456`)
- **Transactions**: Enter a 64-character tx hash
- **Addresses**: Enter a 48-character address

## Project Structure

```
client-explorer/
├── cors-proxy.js      # CORS proxy for development
├── package.json
├── vite.config.js
├── tailwind.config.js  # Design tokens (dark wallet theme)
├── src/
│   ├── api/nodeApi.js  # API client
│   ├── context/        # React context (node selection)
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route pages
│   └── utils/          # Formatting helpers
```

## Design

The explorer uses the **Dark Wallet with Gold Accents** design system:
- Pure black (#000000) backgrounds
- Gold (#FDB913) primary accents
- Glassmorphism cards
- Montserrat typography

## API

The explorer connects directly to the node's RPC endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /chain/head` | Chain head info |
| `GET /chain/block/:id` | Block by height or hash |
| `GET /chain/hashrate/:window` | Hashrate estimate |
| `GET /chart/hashrate/time/:from/:to/:interval` | Hashrate chart data |
| `GET /transaction/lookup/:txid` | Transaction lookup |
| `GET /transaction/mempool` | Pending transactions |
| `GET /account/:account/wart_balance` | WART balance |
| `GET /account/:account/history/:beforeId` | Transaction history |
| `GET /asset/lookup/:asset` | Asset lookup by hash |
| `GET /asset/complete?namePrefix=&hashPrefix=` | Asset autocomplete |
| `GET /account/richlist/:tokenspec` | Asset or liquidity richlist |
| `GET /dex/market/:asset` | Market data for asset |
| `GET /account/:account/balance/:tokenspec` | Token balance by tokenspec |
| `GET /tools/info` | Node info |

For full API documentation, see the [Warthog API docs](https://github.com/warthog-network/docs).

## Build for Production

```bash
npm run build
```

Output is in `dist/`. Serve with any static file server.

## Troubleshooting

### CORS Errors

If you see `NetworkError when attempting to fetch resource`:
1. Start the CORS proxy: `node cors-proxy.js`
2. In the explorer, set the node URL to `localhost:3101` (the proxy)

### Connection Refused

Ensure the node is running and the RPC port matches:
```bash
./wart-node --rpc=0.0.0.0:3100
```

### Node Not Synced

The explorer shows a "Syncing" indicator when the node is behind. Wait for sync to complete.
