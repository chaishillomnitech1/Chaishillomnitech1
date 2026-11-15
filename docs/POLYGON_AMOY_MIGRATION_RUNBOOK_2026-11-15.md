# Polygon Amoy Testnet Migration and Deployment Runbook

**Updated:** 2026-11-15  
**Status:** Testnet configuration guide. This is not a mainnet release approval.

## Network targets

| Network | Chain ID | Runtime variable | Use |
|---|---:|---|---|
| Polygon Amoy | 80002 | `AMOY_RPC_URL` | Test deployments and validation |
| Polygon PoS mainnet | 137 | `POLYGON_RPC_URL` | Production only after independent clearance |

Polygon Mumbai (80001) is retired. Do not use `mumbai` network aliases, Mumbai RPC endpoints, or Mumbai explorer URLs for new work.

## Configure Amoy

Set `AMOY_RPC_URL` and `POLYGONSCAN_API_KEY` in the secure runtime or CI secret store. Do not commit provider credentials or private keys. The root Hardhat configuration only registers the Amoy network when `AMOY_RPC_URL` is present.

Use a dedicated test-only signer with no mainnet funds. Confirm the provider reports chain ID 80002 before any deployment.

## Verify the deployment script before execution

The root repository contains legacy deployment scripts and historical command references. Do not assume that changing the Hardhat network config makes every script safe. Before using a script, inspect its exact source and confirm:

- No fallback vault, treasury, recipient, or deployer address is silently substituted.
- No placeholder, example, or zero metadata URI can be used.
- Constructor arguments and token supply are explicit and reviewed.
- The signer is the intended test-only account.
- The script refuses any chain other than Amoy.
- Deployment output records contract address, transaction hash, chain ID, block number, compiler settings, and source commit.
- Verification is performed against the matching Amoy explorer and exact compiler settings.

Run the project's relevant tests and static checks before deployment. The `--network amoy` argument is only valid for scripts that have been reviewed for the current configuration.

## Mainnet release gate

Polygon mainnet remains separately locked. A mainnet release requires all of the following evidence:

1. Independent security audit of the exact source commit and dependency lockfile.
2. Passing unit, integration, invariant, fuzz, and deployment-preflight tests.
3. Reproducible build and verified source for each deployed contract.
4. Explicit non-placeholder vault, treasury, metadata, and role addresses.
5. Multisig custody and verified contract ownership/roles before any user-value operations.
6. Reviewed token economics, supply, reward funding, pause/emergency controls, upgrade authority, and recovery procedures.
7. A signed release manifest linking source commit, compiler, audit, deployment transactions, chain ID, contract addresses, verification records, and multisig approvals.
8. Separate human release authorization.

A passing Amoy test does not grant mainnet clearance. No production deployment, wallet signature, or token movement is authorized by this document.

## Evidence retention

Preserve deployment artifacts and original historical Mumbai records. Mark historical material as superseded; do not delete or rewrite archival evidence. New records must include timestamps, source commit, reviewer, network, and evidence links.

## Polygon references

- Amoy explorer: https://amoy.polygonscan.com/
- Polygon developer documentation: https://docs.polygon.technology/
