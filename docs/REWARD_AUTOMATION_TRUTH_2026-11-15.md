# Contributor Recognition Workflow — Execution Truth

**Updated:** 2026-11-15  
**Status:** Simulation-only points workflow

## Current behavior

The GitHub Actions workflow evaluates merged pull requests, closed issues, or a manual dispatch and calculates a contribution-points figure. It posts a recognition comment and workflow summary.

The workflow does **not**:
- Connect to a blockchain RPC.
- Request or sign with a wallet.
- Call a reward contract.
- Mint or transfer CHX.
- Create an NFT.
- Create a payout or financial claim.
- Produce a transaction hash.

The points are internal pilot scoring only. They are not CHX balances, testnet tokens, financial assets, or guaranteed payments.

## Historical reward copy

Earlier workflow comments referred to Polygon Mumbai and stated that tokens would be distributed within 24 hours or that production rewards would follow mainnet launch. Those statements did not match the implementation: the workflow's distribution section contained a TODO and printed a simulated result. The updated workflow removes those promises and removes unused reward private-key/RPC/contract secrets.

Historical PR comments are preserved as issued. This document and the updated workflow supersede their operational wording for future runs.

## Change control for any future on-chain rewards

A future on-chain reward implementation must be a separate reviewed change with:
- A dedicated audited reward contract and verified source.
- Explicit chain ID and network configuration.
- A funded and approved multisig-controlled reward treasury.
- Recipient identity-to-wallet verification and anti-duplication controls.
- Human approval and per-reward limits.
- Transaction hash and chain-confirmation evidence.
- Clear testnet-vs-mainnet labeling.
- No promise of payment until the transaction is confirmed on the named chain.

No such on-chain reward system is implemented by the current workflow.
