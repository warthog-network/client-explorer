# Warthog Client Explorer - AI Agent Documentation

This document contains key insights and conventions for AI agents working on the Warthog Client Explorer codebase.

## Project Overview

The Warthog Client Explorer is a React-based blockchain explorer that connects to the Warthog node's REST API. It uses:
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with dark wallet theme (gold accents)
- **Routing**: React Router v6
- **Icons**: React Icons (Fa* components)
- **Charts**: Chart.js with react-chartjs-2

## Token Spec

Warthog uses a **token spec** format to uniquely identify tokens on the network.

### Format
```
<specifier>:<asset_hash>
```

### Specifier Types
| Specifier | Description |
|-----------|-------------|
| `asset` | The actual asset token itself |
| `liquidity` | The liquidity token representing a user's share in the asset/WART liquidity pool |

### URL Convention
All token links use the URL format:
- `/token/asset:<hash>` - Asset detail page
- `/token/liquidity:<hash>` - Liquidity detail page

The **Tokens page** (`/tokens`) lists all assets. Each row links to `/token/asset:<hash>`.

## Pages and Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Chain head, hashrate chart, recent blocks |
| `/block/:id` | Block | Block details with all transactions |
| `/tx/:txid` | Transaction | Transaction details |
| `/address/:address` | Account | Account balance and history |
| `/tokens` | Tokens | List of all assets |
| `/token/:tokenspec` | Token | Token detail (asset or liquidity) |
| `/mempool` | Mempool | Pending transactions |

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
Display: Name, Supply, Decimals, Created Asset (link or "not mined")
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

## UI Conventions

### CopyableAmount Component
All numeric values that can be copied use the `CopyableAmount` component:
- Yellow text color (`text-primary`)
- Cursor pointer with hover underline
- Click to copy to clipboard
- Shows "(copied)" for 1.5 seconds after click

### Asset/Liquidity Display Format
For transaction details involving assets:
- **Amount with unit**: `100 ABC (abc123...def456)` where the unit is a clickable link
- **For WART**: `100 WART` (not linked)
- **For liquidity**: `ABC-Liquidity (abc123...def456)` linking to `/token/liquidity:...`

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
│   ├── Layout.jsx       # Main layout with nav
│   ├── NodeSelector.jsx # Node URL selector
│   ├── TransactionDetails.jsx  # Type-specific tx display
│   └── TransactionRow.jsx      # Compact tx row for lists
├── context/
│   └── NodeContext.jsx  # Node URL state
├── pages/
│   ├── Account.jsx      # Account detail
│   ├── Block.jsx        # Block detail
│   ├── Dashboard.jsx    # Home page
│   ├── Mempool.jsx      # Mempool view
│   ├── Token.jsx        # Token detail (asset/liquidity)
│   └── Tokens.jsx       # Asset list
└── utils/format.js      # Formatting helpers
```

## Address Format

Addresses are 48-character hex strings. Displayed with `formatAddress(addr, chars)` which abbreviates to `first_chars...last_chars`.

## WART

WART is the native cryptocurrency. It is used for:
- Transaction fees
- As the quote currency in liquidity pools (asset/WART pairs)

WART uses 8 decimal places internally (E8), where 1 WART = 10^8 E8.