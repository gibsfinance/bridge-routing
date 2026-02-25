# Bridge-Routing Project

## Codebase Overview

**Gibs Finance** is a production cross-chain token bridge platform enabling transfers between Pulsechain, Ethereum, BSC, and testnets. Built as a Yarn v4 monorepo with four packages: Common (utilities), Bridge SDK (configuration), Indexer (event tracking), and UI (Svelte 5 frontend).

**Stack**: Svelte 5 (runes), Vite 6, TailwindCSS v4, Viem, Wagmi, Reown AppKit, Ponder, PostgreSQL, Docker

**Structure**:
- `packages/common` - Low-level blockchain utilities (caching, multicall, serialization)
- `packages/bridge-sdk` - Bridge pathways, fee calculation, transaction construction
- `packages/indexer` - Ponder-based event indexer with GraphQL API (25 database tables)
- `packages/ui` - Svelte 5 reactive UI (77 components, 67 stores)

For detailed architecture, see [docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md).

## Quick Start

**Development**:
```bash
yarn                          # Install dependencies
cp packages/ui/.example.env packages/ui/.env
# Edit packages/ui/.env and set PUBLIC_PROJECT_ID to your Reown project ID
# Get one at: https://cloud.reown.com/
yarn dev                      # Start UI dev server (localhost:5173)
```

**Production Build**:
```bash
yarn build                    # Build all packages
yarn ui:preview              # Preview production build
```

**Docker**:
```bash
docker compose up            # Postgres + Indexer + UI
```

## Key Features

- Multi-chain bridges (Pulsechain ↔ Ethereum, Pulsechain ↔ BSC)
- Real-time transaction tracking via GraphQL indexer
- PulseX DEX integration for swaps and price discovery
- Delivery service with automatic fee compensation
- Native asset wrapping/unwrapping
- Multi-wallet support (EVM, Solana, Sui, Bitcoin via Reown AppKit)
- IPFS deployment ready with relative paths

## Architecture Highlights

**Bridge Flow**: UI → Bridge SDK (pathway lookup, fee calculation) → Wallet (sign tx) → AMB Contract → Indexer (event tracking) → GraphQL API → UI (status updates)

**Indexer**: Ponder framework tracks 15 event types across 5+ contract types, maintains 25 PostgreSQL tables with omnichain ordering for cross-chain consistency

**UI State**: Svelte 5 runes-based stores with ~25 computed values cascading from bridge configuration, reactive block watchers, and localStorage persistence

## Navigation Guide

- **Add bridge pathway**: Modify `packages/bridge-sdk/src/chains.ts` and `packages/indexer/ponder.config.ts`
- **Add chain**: Update chain metadata in SDK, add to indexer config, set RPC env vars
- **Add token**: Include in token lists or users can add via UI (custom tokens)
- **Debug transactions**: Check `BridgeProgress` UI component, query GraphQL indexer, verify SDK calldata
- **Modify fees**: On-chain `FeeManager.setFee()` → indexer auto-detects → SDK fetches → UI displays

## Critical Gotchas

1. **Svelte 5**: Uses runes (`$state`, `$derived`, `$effect`) - not compatible with Svelte 4
2. **Environment Variables**: Must be `PUBLIC_*` prefixed, replaced at build time (not runtime)
   - **REQUIRED**: `PUBLIC_PROJECT_ID` - Reown (formerly WalletConnect) project ID from https://cloud.reown.com/
   - If upgrading from older version: Rename `PUBLIC_WALLET_CONNECT_ID` → `PUBLIC_PROJECT_ID`
3. **Null Propagation**: SDK functions return `null` for invalid states - always check before use
4. **Bridge Direction**: Fee managers and delivery requirements differ by direction (home→foreign vs foreign→home)
5. **Not-Yet-Bridged Tokens**: `assetOutAddress` can be `null` if token hasn't been bridged before
6. **Zero-Signer Bridges**: Some bridges have no required signatures (handle gracefully)
7. **Memoization**: Heavy caching in SDK (permanent) and UI (TTL-based) - understand cache keys
8. **BigInt Serialization**: Custom JSON serialize/parse required for localStorage
9. **Hash Routing**: Uses `/#/` for static hosting compatibility
10. **React Hybrid**: Embeds React components (LI.FI) inside Svelte via adapter

## Development Workflow

1. **Version Bumps**: Use `npm version patch|minor|major` at root (auto-syncs all packages)
2. **GraphQL Schema**: Run `yarn ui:codegen` after indexer schema changes
3. **Type Checking**: `yarn ui:check` before commits
4. **IPFS Deploy**: `yarn pinata:publish` (requires `PINATA_API_KEY`)

## Contact & Links

- **Staging Indexer**: https://staging.indexer.gibs.finance/graphql
- **Production Site**: https://gibs.finance
- **IPFS Gateway**: https://gib.show

---

For comprehensive documentation including diagrams, data flows, and detailed module guides, see **[docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md)**.
