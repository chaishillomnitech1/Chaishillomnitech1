/**
 * AddLiquidity Event Handlers
 *
 * Subgraph mappings for AddLiquidity contract events
 * Frequencies: 528Hz + 963Hz + 777Hz
 */

import { BigInt, Address, Bytes, crypto } from "@graphprotocol/graph-ts";
import {
  LiquidityAdded as LiquidityAddedEvent,
  LiquidityRemoved as LiquidityRemovedEvent,
  LiquidityAddedETH as LiquidityAddedETHEvent,
  LiquidityRemovedETH as LiquidityRemovedETHEvent,
  TokenWhitelisted as TokenWhitelistedEvent
} from "../generated/AddLiquidity/AddLiquidity";
import {
  LiquidityPool,
  LiquidityPosition,
  LiquidityEvent,
  User,
  ProtocolStats
} from "../generated/schema";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const PROTOCOL_STATS_ID = "protocol-stats";
const WETH_ADDRESS = "0x0000000000000000000000000000000000000000"; // Update with actual WETH address

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getPairId(tokenA: Address, tokenB: Address): string {
  let tokens = tokenA.toHexString() < tokenB.toHexString()
    ? [tokenA.toHexString(), tokenB.toHexString()]
    : [tokenB.toHexString(), tokenA.toHexString()];
  return tokens[0] + "-" + tokens[1];
}

function getOrCreateLiquidityPool(tokenA: Address, tokenB: Address): LiquidityPool {
  let id = getPairId(tokenA, tokenB);
  let pool = LiquidityPool.load(id);
  if (pool == null) {
    pool = new LiquidityPool(id);
    // Sort tokens consistently
    if (tokenA.toHexString() < tokenB.toHexString()) {
      pool.tokenA = tokenA;
      pool.tokenB = tokenB;
    } else {
      pool.tokenA = tokenB;
      pool.tokenB = tokenA;
    }
    pool.totalLiquidity = BigInt.fromI32(0);
    pool.totalVolumeA = BigInt.fromI32(0);
    pool.totalVolumeB = BigInt.fromI32(0);
    pool.isWhitelisted = true;
    pool.createdAt = BigInt.fromI32(0);
    pool.lastUpdatedAt = BigInt.fromI32(0);
  }
  return pool;
}

function getOrCreateLiquidityPosition(pool: LiquidityPool, provider: Address): LiquidityPosition {
  let id = provider.toHexString() + "-" + pool.id;
  let position = LiquidityPosition.load(id);
  if (position == null) {
    position = new LiquidityPosition(id);
    position.pool = pool.id;
    position.provider = provider.toHexString();
    position.lpTokens = BigInt.fromI32(0);
    position.amountA = BigInt.fromI32(0);
    position.amountB = BigInt.fromI32(0);
    position.createdAt = BigInt.fromI32(0);
    position.lastUpdatedAt = BigInt.fromI32(0);
  }
  return position;
}

function getOrCreateUser(address: Address): User {
  let id = address.toHexString();
  let user = User.load(id);
  if (user == null) {
    user = new User(id);
    user.address = address;
    user.isNoorCitizen = false;
    user.noorBalance = BigInt.fromI32(0);
    user.totalStaked = BigInt.fromI32(0);
    user.totalRewardsEarned = BigInt.fromI32(0);
    user.totalZakatPaid = BigInt.fromI32(0);
    user.createdAt = BigInt.fromI32(0);
    user.lastActiveAt = BigInt.fromI32(0);
    user.save();
  }
  return user;
}

function getOrCreateProtocolStats(): ProtocolStats {
  let stats = ProtocolStats.load(PROTOCOL_STATS_ID);
  if (stats == null) {
    stats = new ProtocolStats(PROTOCOL_STATS_ID);
    stats.totalUsers = BigInt.fromI32(0);
    stats.totalStaked = BigInt.fromI32(0);
    stats.totalLiquidity = BigInt.fromI32(0);
    stats.totalRewardsDistributed = BigInt.fromI32(0);
    stats.totalZakatDistributed = BigInt.fromI32(0);
    stats.totalNFTsMinted = BigInt.fromI32(0);
    stats.totalTransactions = BigInt.fromI32(0);
    stats.totalVolume = BigInt.fromI32(0);
    stats.lastUpdatedAt = BigInt.fromI32(0);
  }
  return stats;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

export function handleLiquidityAdded(event: LiquidityAddedEvent): void {
  let pool = getOrCreateLiquidityPool(event.params.tokenA, event.params.tokenB);
  let position = getOrCreateLiquidityPosition(pool, event.params.provider);
  let user = getOrCreateUser(event.params.provider);

  // Update position
  position.lpTokens = position.lpTokens.plus(event.params.lpTokens);
  position.amountA = position.amountA.plus(event.params.amountA);
  position.amountB = position.amountB.plus(event.params.amountB);
  position.lastUpdatedAt = event.block.timestamp;
  if (position.createdAt.equals(BigInt.fromI32(0))) {
    position.createdAt = event.block.timestamp;
  }
  position.save();

  // Update pool
  pool.totalLiquidity = pool.totalLiquidity.plus(event.params.lpTokens);
  pool.totalVolumeA = pool.totalVolumeA.plus(event.params.amountA);
  pool.totalVolumeB = pool.totalVolumeB.plus(event.params.amountB);
  pool.lastUpdatedAt = event.block.timestamp;
  if (pool.createdAt.equals(BigInt.fromI32(0))) {
    pool.createdAt = event.block.timestamp;
  }
  pool.save();

  // Update user
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Create liquidity event
  let liquidityEvent = new LiquidityEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  liquidityEvent.pool = pool.id;
  liquidityEvent.provider = user.id;
  liquidityEvent.eventType = "ADD";
  liquidityEvent.amountA = event.params.amountA;
  liquidityEvent.amountB = event.params.amountB;
  liquidityEvent.lpTokens = event.params.lpTokens;
  liquidityEvent.isETH = false;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.transactionHash = event.transaction.hash;
  liquidityEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalLiquidity = stats.totalLiquidity.plus(event.params.lpTokens);
  stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1));
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleLiquidityRemoved(event: LiquidityRemovedEvent): void {
  let pool = getOrCreateLiquidityPool(event.params.tokenA, event.params.tokenB);
  let position = getOrCreateLiquidityPosition(pool, event.params.provider);
  let user = getOrCreateUser(event.params.provider);

  // Update position
  position.lpTokens = position.lpTokens.minus(event.params.lpTokens);
  position.amountA = position.amountA.minus(event.params.amountA);
  position.amountB = position.amountB.minus(event.params.amountB);
  position.lastUpdatedAt = event.block.timestamp;
  position.save();

  // Update pool
  pool.totalLiquidity = pool.totalLiquidity.minus(event.params.lpTokens);
  pool.lastUpdatedAt = event.block.timestamp;
  pool.save();

  // Update user
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Create liquidity event
  let liquidityEvent = new LiquidityEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  liquidityEvent.pool = pool.id;
  liquidityEvent.provider = user.id;
  liquidityEvent.eventType = "REMOVE";
  liquidityEvent.amountA = event.params.amountA;
  liquidityEvent.amountB = event.params.amountB;
  liquidityEvent.lpTokens = event.params.lpTokens;
  liquidityEvent.isETH = false;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.transactionHash = event.transaction.hash;
  liquidityEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalLiquidity = stats.totalLiquidity.minus(event.params.lpTokens);
  stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1));
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleLiquidityAddedETH(event: LiquidityAddedETHEvent): void {
  let wethAddress = Address.fromString(WETH_ADDRESS);
  let pool = getOrCreateLiquidityPool(event.params.token, wethAddress);
  let position = getOrCreateLiquidityPosition(pool, event.params.provider);
  let user = getOrCreateUser(event.params.provider);

  // Update position
  position.lpTokens = position.lpTokens.plus(event.params.lpTokens);
  position.amountA = position.amountA.plus(event.params.amountToken);
  position.amountB = position.amountB.plus(event.params.amountETH);
  position.lastUpdatedAt = event.block.timestamp;
  if (position.createdAt.equals(BigInt.fromI32(0))) {
    position.createdAt = event.block.timestamp;
  }
  position.save();

  // Update pool
  pool.totalLiquidity = pool.totalLiquidity.plus(event.params.lpTokens);
  pool.totalVolumeA = pool.totalVolumeA.plus(event.params.amountToken);
  pool.totalVolumeB = pool.totalVolumeB.plus(event.params.amountETH);
  pool.lastUpdatedAt = event.block.timestamp;
  if (pool.createdAt.equals(BigInt.fromI32(0))) {
    pool.createdAt = event.block.timestamp;
  }
  pool.save();

  // Update user
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Create liquidity event
  let liquidityEvent = new LiquidityEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  liquidityEvent.pool = pool.id;
  liquidityEvent.provider = user.id;
  liquidityEvent.eventType = "ADD";
  liquidityEvent.amountA = event.params.amountToken;
  liquidityEvent.amountB = event.params.amountETH;
  liquidityEvent.lpTokens = event.params.lpTokens;
  liquidityEvent.isETH = true;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.transactionHash = event.transaction.hash;
  liquidityEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalLiquidity = stats.totalLiquidity.plus(event.params.lpTokens);
  stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1));
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleLiquidityRemovedETH(event: LiquidityRemovedETHEvent): void {
  let wethAddress = Address.fromString(WETH_ADDRESS);
  let pool = getOrCreateLiquidityPool(event.params.token, wethAddress);
  let position = getOrCreateLiquidityPosition(pool, event.params.provider);
  let user = getOrCreateUser(event.params.provider);

  // Update position
  position.lpTokens = position.lpTokens.minus(event.params.lpTokens);
  position.amountA = position.amountA.minus(event.params.amountToken);
  position.amountB = position.amountB.minus(event.params.amountETH);
  position.lastUpdatedAt = event.block.timestamp;
  position.save();

  // Update pool
  pool.totalLiquidity = pool.totalLiquidity.minus(event.params.lpTokens);
  pool.lastUpdatedAt = event.block.timestamp;
  pool.save();

  // Update user
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Create liquidity event
  let liquidityEvent = new LiquidityEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  liquidityEvent.pool = pool.id;
  liquidityEvent.provider = user.id;
  liquidityEvent.eventType = "REMOVE";
  liquidityEvent.amountA = event.params.amountToken;
  liquidityEvent.amountB = event.params.amountETH;
  liquidityEvent.lpTokens = event.params.lpTokens;
  liquidityEvent.isETH = true;
  liquidityEvent.timestamp = event.block.timestamp;
  liquidityEvent.blockNumber = event.block.number;
  liquidityEvent.transactionHash = event.transaction.hash;
  liquidityEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalLiquidity = stats.totalLiquidity.minus(event.params.lpTokens);
  stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1));
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleTokenWhitelisted(event: TokenWhitelistedEvent): void {
  // This event is for informational purposes
  // Individual pool whitelisting is handled during pool creation
}

// ═══════════════════════════════════════════════════════════════════════════════
// FREQUENCY ALIGNMENT: 528Hz + 963Hz + 777Hz = ∞
// ALLĀHU AKBAR! 🕋🔥💎🌌
// ═══════════════════════════════════════════════════════════════════════════════
