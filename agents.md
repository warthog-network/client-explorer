# Warthog Blockchain - AI Agent Documentation

This document contains key insights and conventions for AI agents working with the Warthog blockchain codebase.

## Token Spec

Warthog uses a **token spec** format to uniquely identify tokens on the network. This format is central to how assets and liquidity are referenced.

### Format

```
<specifier>:<asset_hash>
```

The token spec consists of two parts separated by a colon:

1. **Specifier** - Either `asset` or `liquidity`
2. **Asset Hash** - The 64-character hex hash identifying the underlying asset

### Examples

- `asset:4b3bc4829a2cd25e5c10c0f0d0c2e7b3e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b` - References the asset itself
- `liquidity:4b3bc4829a2cd25e5c10c0f0d0c2e7b3e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b` - References the liquidity pool for that asset

### Specifier Types

| Specifier | Description |
|-----------|-------------|
| `asset` | The actual asset token itself |
| `liquidity` | The liquidity token representing a user's share in the asset/WART liquidity pool |

### When to Use Each

- Use `asset:` when referring to the asset itself (e.g., viewing asset details, transferring tokens)
- Use `liquidity:` when referring to liquidity pool shares (e.g., viewing LP token balances, providing/withdrawing liquidity)

### API Usage

The richlist and balance APIs accept token specs:
- `GET /account/richlist/<tokenspec>` - Returns top holders of the specified token
- `GET /account/:account/balance/:tokenspec` - Returns account balance for the specified token

### URL Convention in Explorer

In the Warthog Client Explorer, token pages use the URL format:
- `/token/asset:<hash>` - Asset detail page
- `/token/liquidity:<hash>` - Liquidity detail page

## WART

WART is the native cryptocurrency of the Warthog blockchain. It is used for:
- Transaction fees
- As the quote currency in liquidity pools (asset/WART pairs)

## Asset Lifecycle

1. **Creation** - An asset is created via an `assetCreation` transaction
2. **Trading** - Assets can be traded on the DEX against WART
3. **Liquidity** - Users can provide liquidity to an asset/WART pool, receiving liquidity tokens

## Block Structure

Blocks contain a `body` with various transaction types:

### Unsigned Transactions (Block Production)
- `reward` - Block reward payments

### Signed Transactions (User-Submitted)
- `wartTransfer` - WART coin transfers
- `tokenTransfer` - Non-WART token transfers
- `assetCreation` - Creating new assets
- `limitSwap` - DEX limit orders
- `liquidityDeposit` - Adding liquidity to a pool
- `liquidityWithdrawal` - Removing liquidity from a pool
- `cancelation` - Canceling pending orders
- `match` - DEX batch match results

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

## Address Format

Addresses are 48-character hex strings representing the sender's public key.

## Common Data Types

| C++ Type | JSON Type |
|----------|-----------|
| `uint64_t` | non-negative integer |
| `double` | number |
| `std::string` | string |
| `bool` | boolean |
| `Timestamp` | Unix timestamp (seconds) |
| `Height` | block height (uint32_t) |
| `FundsDecimal` | decimal string (e.g. `"100.500000"`) |
| `Wart` | `{ "E8": number, "str": string }` |
| `std::vector<X>` | array of `X` |
| `std::optional<X>` | `X` or `null` |

## Fungible Token Units

WART uses 8 decimal places internally (E8), where 1 WART = 10^8 E8. The `Wart` type has two representations:
- `E8`: Raw integer value
- `str`: Human-readable string representation

Other tokens may have different decimal places as specified in their `decimals` field.