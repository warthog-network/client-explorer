# Warthog Client Explorer - AI Agent Documentation

This document contains key insights and conventions for AI agents working on the Warthog Client Explorer codebase.

## Project Overview

The Warthog Client Explorer is a React-based blockchain explorer that connects to the Warthog node's REST API. It uses:
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with dark wallet theme (gold accents)
- **Routing**: React Router v6
- **Icons**: React Icons (Fa* components)
- **Charts**: Chart.js with react-chartjs-2

## Design Scheme

### Color System
| Color | Usage | Tailwind Class |
|-------|-------|----------------|
| Primary | All copyable values, links, clickable elements | `text-primary` |
| White | Regular text | `text-white` |
| White Muted | Labels, secondary text | `text-white/50` or `text-white/40` |
| Green | Success states, confirmed transactions | `text-green-400` |
| Red | Sell orders, errors | `text-red-400` |

### Typography
| Style | Usage | Tailwind Class |
|-------|-------|----------------|
| Preformatted/Code | All values (addresses, hashes, amounts, numbers) | `font-mono` |
| Small | Values in detail rows | `text-sm` (14px) |
| Extra Small | Labels, muted text | `text-xs` (12px) |
| Large | Headers | `text-lg` or `text-xl` |

### Consistency Rules
1. **Same content type = same style** across all pages
2. **All values use `font-mono`** - addresses, hashes, amounts, numbers
3. **All copyable values are primary by default** - CopyableValue component handles this
4. **All links use `text-primary`** - blue/gold color for clickable elements
5. **Detail rows** - use `DetailRow` component for consistent styling
6. **Balance displays** - use `BalanceRow` component for consistent styling

## URL Structure

### Current Token URLs
All token links use the URL format:
- `/asset/<hash>/` - Asset detail page
- `/asset/<hash>/liquidity` - Liquidity detail page
- `/asset/<hash>/orders` - Orders (buy/sell order books)
- `/asset/wart` - WART richlist (special case - no sub-tabs)

### Legacy Format (DEPRECATED)
Old format `/token/asset:<hash>` should no longer be used.

### Pages and Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Chain head, hashrate chart, recent blocks |
| `/block/:id` | Block | Block details with all transactions |
| `/tx/:txid` | Transaction | Transaction details |
| `/address/:address` | Account | Account balance and history |
| `/address/:address/:tokenspec` | Account | Account balance for specific token |
| `/tokens` | Tokens | List of all assets |
| `/asset/wart` | Token | WART richlist only |
| `/asset/:hash` | TokenLayout | Token with nested routes (AssetTab, LiquidityTab, OrdersTab) |
| `/asset/:hash/liquidity` | TokenLayout > LiquidityTab | Liquidity view |
| `/asset/:hash/orders` | TokenLayout > OrdersTab | Orders view |
| `/mempool` | Mempool | Pending transactions |

## Token Page Architecture

The Token page uses **nested routes** to achieve persistent headline when switching tabs:

```
/asset/:hash              → TokenLayout + AssetTab (index)
/asset/:hash/liquidity   → TokenLayout + LiquidityTab
/asset/:hash/orders       → TokenLayout + OrdersTab
/asset/wart               → Token (standalone, no tabs)
```

### Key Components
- **TokenLayout.jsx** - Persistent header (back button, headline, tabs, refresh). Uses `useOutletContext()` to pass data to tab components.
- **AssetTab.jsx** - Asset details + Asset Rich List
- **LiquidityTab.jsx** - Liquidity Pool + Liquidity Rich List
- **LiquidityRichList** - Fetched lazily on first visit to liquidity tab via `fetchLiquidityRichlist()`

### Token Headline Format
```
<FaCoins icon> <asset.name> (<asset.hash>)
```
Both asset name and asset hash are individually copyable via CopyableValue.

## Transaction Page Layout

The Transaction page displays a single unified box with multiple sections:

```
┌─────────────────────────────────────────┐
│ Transaction Hash          │ Confirmations │
├─────────────────────────────────────────┤
│ Signer                                          │
│   Signer: 0x123...     Fee: 0.001 WART       │
│   Nonce: 5              Pin Height: -         │
├─────────────────────────────────────────┤
│ Block                                          │
│   Hash: abc123...     Height: #12345         │
│   Time: Jan 1, 2025 10:30 (+5m ago)         │
├─────────────────────────────────────────┤
│ Transfer / Limit Swap / etc.                 │
│   Type-specific fields                       │
├─────────────────────────────────────────┤
│ Result (if applicable)                       │
│   Processed results or "not yet mined"       │
└─────────────────────────────────────────┘
```

### Sections:
1. **Transaction Hash + Confirmations** - Single row, hash on left, confirmations on right
2. **Signer** - Signer address, Fee, Nonce, Pin Height (always shown for signed transactions)
3. **Block** - Hash, Height, Time (clickable to toggle unix/local time)
4. **Type-specific** - Transfer, Limit Swap, Asset Creation, etc.
5. **Result** - Only for: `assetCreation`, `cancelation`, `liquidityDeposit`, `liquidityWithdrawal`, `limitSwap`

## Transaction Types

### wartTransfer / tokenTransfer
Display: To address, Amount with unit

### assetCreation
Display: Name, Supply, Decimals, Created Asset (link to asset page using txHash as fallback if data.hash is undefined)
Result: Asset ID (if mined)

### cancelation
Display: Account ID, Nonce ID, Pin Height
Result: Canceled TX hash (if mined)

### liquidityDeposit
Display: Base Amount with asset unit, Quote Amount with WART
Result: Shares Received with liquidity unit link

### liquidityWithdrawal
Display: Asset (linked), Shares redeemed
Result: Base Received, Quote Received (WART)

### limitSwap
Display: Side (BUY/SELL), Asset (linked), Amount, Price
Result: Remaining amount (if mined)

### reward
Display: To address, Amount (+ prefix)

### match
Display: Asset (linked), Pool Before/After, Buy/Sell swaps

## UI Components

### CopyableValue Component
All copyable values default to primary (`text-primary`) and font-mono. Parent can override with explicit className.

```jsx
// Default: primary, font-mono, cursor-pointer, hover underline
<CopyableValue value={amount} />

// Override to white (rarely needed)
<CopyableValue value={amount} className="text-white" />

// With custom size styling
<CopyableValue value={amount} className="text-primary text-sm" />

// Display formatted value but copy raw value
<CopyableValue value={rawValue} display={formattedValue} />
```

### CopyableTimestamp Component
Used for timestamps. Inherits yellow from CopyableValue, adds `text-sm font-mono`.

### CopyableAddress Component
Used for addresses. Inherits yellow from CopyableValue.

### DetailRow Component
For consistent styling in detail pages (Block, Transaction). All values use `text-sm font-mono`.

```jsx
// Hash value (copyable, primary)
<DetailRow label="Block Hash" value={hash} copyable breakAll />

// Timestamp
<DetailRow label="Timestamp" timestamp={timestamp} />

// Plain value (white)
<DetailRow label="Confirmations" value={count} />

// Linked value (primary)
<DetailRow label="Previous Hash" value={prevHash} link={`/block/${prevHash}`} breakAll />
```

### BalanceRow Component
For consistent balance display (Account page).

```jsx
// WART balance
<BalanceRow label="Total" value={balance.total} unit="WART" unitLink="/asset/wart" color="text-primary" />

// Asset balance with liquidity
<BalanceRow label="Total" value={balance.total} unit={name} unitLink={`/asset/${hash}/`} liqValue={liqBalance.total} liqUnit="LP" liqUnitLink={`/asset/${hash}/liquidity`} color="text-primary" />
```

### AddressWithTag Component
**All address displays should use AddressWithTag** for address tag support.

```jsx
// Shortened address (default 6 chars each side)
<AddressWithTag address={addr} />

// Full address with automatic break-all
<AddressWithTag address={addr} display={addr} className="text-sm" />

// Explicitly shortened
<AddressWithTag address={addr} showFull={false} />
```

**Props:**
- `address` (required) - The address to display
- `display` - Show full address string (auto-adds break-all)
- `showFull` - Show full address (not shortened), default false
- `mono` - Use font-mono, default true
- `className` - Additional classes

## UI Conventions

### Asset/Liquidity Display Format
For transaction details involving assets:
- **Amount with unit**: `100 ABC (abc123...def456)` where the unit is a clickable link
- **For WART**: `100 WART` (linked to `/asset/wart`)
- **For liquidity**: `ABC-Liquidity (abc123...def456)` linking to `/asset/<hash>/liquidity`

### Block Navigation
Block detail page header shows navigation triangles:
- ◀ (left) - Previous block, only if height > 1
- ▶ (right) - Next block, only if confirmations > 1 (not at current tip)

### Time Display
- Block time is clickable to toggle between:
  - Human readable: `Jan 1, 2025 10:30`
  - Unix timestamp: `1735732200`
- Relative time shown in parentheses: `(+5m ago)`

### Section Headers
Section headers use small muted text:
```jsx
<div className="text-xs text-white/50 mb-2">Section Name</div>
```

### Network Values in Dashboard
All network values (Chain Length, Chain Work, Difficulty, Hashrate) use `font-mono`:
```jsx
<div className="text-lg text-white font-mono">
  {formatNumber(chainHead.height)}
</div>
```

### Transaction Row Values
- Addresses: Use `AddressWithTag`
- Asset names with hash: `font-mono` for both, hash in muted color
- Amounts: Use `CopyableValue` with `font-mono` class
- Units (WART, token symbols): Use `font-mono`

## Common Data Types

| C++ Type | JSON Type |
|----------|-----------|
| `uint64_t` | non-negative integer |
| `double` | number |
| `std::string` | string |
| `bool` | boolean |
| `Timestamp` | Unix timestamp (seconds) |
| `Height` | block height (uint32_t) |
| `FundsDecimal` | `{ "decimals": int, "str": string, "u64": number }` |
| `Wart` | `{ "E8": number, "str": string }` |

## API Response Format

All API endpoints return a wrapper object:

```json
{
  "code": 0,
  "data": <response data>
}
```

Error responses:
```json
{
  "code": <error code>,
  "error": <error message>
}
```

## File Structure

```
src/
├── api/nodeApi.js       # API client functions
├── components/
│   ├── AddressWithTag.jsx    # Address with tag badge support
│   ├── BalanceRow.jsx        # Balance display row
│   ├── CopyableAddress.jsx   # Copyable address (legacy)
│   ├── CopyableTimestamp.jsx  # Copyable timestamp
│   ├── CopyableValue.jsx     # Generic copyable value
│   ├── DetailRow.jsx         # Detail page row
│   ├── Layout.jsx       # Main layout with nav
│   ├── NodeSelector.jsx # Node URL selector
│   ├── TransactionDetails.jsx  # Type-specific tx display
│   └── TransactionRow.jsx      # Compact tx row for lists
├── context/
│   └── NodeContext.jsx  # Node URL state
├── pages/
│   ├── Account.jsx      # Account detail with token balance selector
│   ├── AssetTab.jsx     # Asset tab content (nested route)
│   ├── Block.jsx        # Block detail with nav triangles
│   ├── Dashboard.jsx    # Home page
│   ├── LiquidityTab.jsx # Liquidity tab content (nested route)
│   ├── Mempool.jsx      # Mempool view
│   ├── OrdersTab.jsx    # Orders tab content (nested route)
│   ├── Token.jsx        # Token detail for /asset/wart (standalone)
│   ├── TokenLayout.jsx  # Token layout with headline + tabs (nested route parent)
│   └── Tokens.jsx       # Asset list
├── utils/format.js      # Formatting helpers
└── config/
    └── addressTags.js   # Known address tags configuration
```

## Address Format

Addresses are 48-character hex strings. Displayed with `formatAddress(addr, chars)` which abbreviates to `first_chars...last_chars`.

**Important**: Use `AddressWithTag` component for all address displays to ensure address tag badges are shown.

## WART

WART is the native cryptocurrency. It is used for:
- Transaction fees
- As the quote currency in liquidity pools (asset/WART pairs)

WART uses 8 decimal places internally (E8), where 1 WART = 10^8 E8.

- WART page at `/asset/wart` shows only richlist
- Account balances for WART show 3 values: Total, Locked, Mempool
- Assets show 6 values: Asset Total/Locked/Mempool + Liquidity Total/Locked/Mempool

## Special Cases

### AssetCreation Transaction Details
For `AssetCreationDetails`, the asset hash may not be available in `data.hash` immediately. The transaction hash (`txHash`) should be used as a fallback:
```jsx
const assetHash = data.hash || txHash;
```

### Liquidity Richlist
The liquidity richlist is fetched lazily on first visit to the liquidity tab to avoid unnecessary API calls. It uses a cache flag `liquidityRichlistLoaded` to prevent re-fetching.

### Token Headline Persistence
The token page headline (name + hash) persists when switching tabs because:
- Tab buttons are inside TokenLayout (not re-rendered)
- Only the `<Outlet>` content changes when switching tabs

## GitHub Pages Deployment

### Workflow
The project uses GitHub Actions for automated deployment to GitHub Pages:
- **Trigger**: Push to `web` branch
- **Workflow file**: `.github/workflows/deploy.yml`

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BASE` | Base path for assets and routes | `/` (root) |

The `VITE_BASE` is stored as a **GitHub Actions repository variable** (Settings → Variables → Actions), not hardcoded.

### Vite Config
```js
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  // ...
})
```

When building for GitHub Pages:
- Set `VITE_BASE` to `/client-explorer/` (or your repo path)
- All asset paths and routes will be prefixed accordingly
