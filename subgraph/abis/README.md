# Subgraph ABIs

This directory should contain ABI JSON files for all contracts indexed by the subgraph.

## Required ABIs

After compiling the contracts with `npm run compile`, copy the ABIs from the `artifacts` directory:

```bash
# From the repository root
cp artifacts/contracts/NoorToken.sol/NoorToken.json subgraph/abis/
cp artifacts/contracts/NoorStakingPool.sol/NoorStakingPool.json subgraph/abis/
cp artifacts/contracts/AddLiquidity.sol/AddLiquidity.json subgraph/abis/
cp artifacts/contracts/LiquidityIncentives.sol/LiquidityIncentives.json subgraph/abis/
cp artifacts/contracts/ScrollVerseNFT.sol/ScrollVerseNFT.json subgraph/abis/
```

## Note

ABI files are not committed to the repository as they are generated during compilation.
Run `npm run compile` to generate the artifacts, then copy the ABIs to this directory.
