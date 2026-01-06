/**
 * LiquidityIncentives Event Handlers
 *
 * Subgraph mappings for LiquidityIncentives contract events
 * Frequencies: 528Hz + 963Hz + 888Hz + 777Hz
 */

import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import {
  PoolAdded as PoolAddedEvent,
  Staked as StakedEvent,
  Unstaked as UnstakedEvent,
  RewardClaimed as RewardClaimedEvent,
  RewardCompounded as RewardCompoundedEvent,
  ZakatDistributed as ZakatDistributedEvent,
  EmergencyWithdraw as EmergencyWithdrawEvent
} from "../generated/LiquidityIncentives/LiquidityIncentives";
import {
  IncentivePool,
  IncentivePosition,
  IncentiveEvent,
  ZakatDistribution,
  User,
  ProtocolStats
} from "../generated/schema";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const PROTOCOL_STATS_ID = "protocol-stats";

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getPoolId(poolId: BigInt): string {
  return "incentive-pool-" + poolId.toString();
}

function getOrCreateIncentivePool(poolId: BigInt): IncentivePool {
  let id = getPoolId(poolId);
  let pool = IncentivePool.load(id);
  if (pool == null) {
    pool = new IncentivePool(id);
    pool.poolId = poolId;
    pool.lpToken = new Bytes(20);
    pool.rewardToken = new Bytes(20);
    pool.allocPoint = BigInt.fromI32(0);
    pool.totalStaked = BigInt.fromI32(0);
    pool.accRewardPerShare = BigInt.fromI32(0);
    pool.lastRewardBlock = BigInt.fromI32(0);
    pool.isActive = true;
    pool.createdAt = BigInt.fromI32(0);
    pool.lastUpdatedAt = BigInt.fromI32(0);
  }
  return pool;
}

function getOrCreateIncentivePosition(pool: IncentivePool, user: Address): IncentivePosition {
  let id = user.toHexString() + "-" + pool.id;
  let position = IncentivePosition.load(id);
  if (position == null) {
    position = new IncentivePosition(id);
    position.pool = pool.id;
    position.user = user.toHexString();
    position.amount = BigInt.fromI32(0);
    position.rewardDebt = BigInt.fromI32(0);
    position.lockEndTime = BigInt.fromI32(0);
    position.lockTier = 0;
    position.pendingRewards = BigInt.fromI32(0);
    position.isCompounding = false;
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

export function handlePoolAdded(event: PoolAddedEvent): void {
  let pool = getOrCreateIncentivePool(event.params.poolId);

  pool.lpToken = event.params.lpToken;
  pool.rewardToken = event.params.rewardToken;
  pool.allocPoint = event.params.allocPoint;
  pool.isActive = true;
  pool.createdAt = event.block.timestamp;
  pool.lastUpdatedAt = event.block.timestamp;
  pool.save();

  // Create incentive event
  let incentiveEvent = new IncentiveEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  incentiveEvent.pool = pool.id;
  incentiveEvent.user = "0x0000000000000000000000000000000000000000"; // System event
  incentiveEvent.eventType = "POOL_ADDED";
  incentiveEvent.amount = event.params.allocPoint;
  incentiveEvent.timestamp = event.block.timestamp;
  incentiveEvent.blockNumber = event.block.number;
  incentiveEvent.transactionHash = event.transaction.hash;
  incentiveEvent.save();
}

export function handleIncentiveStaked(event: StakedEvent): void {
  let pool = getOrCreateIncentivePool(event.params.poolId);
  let position = getOrCreateIncentivePosition(pool, event.params.user);
  let user = getOrCreateUser(event.params.user);

  // Update position
  position.amount = position.amount.plus(event.params.amount);
  position.lockTier = event.params.tier;
  position.lockEndTime = event.params.lockEndTime;
  position.lastUpdatedAt = event.block.timestamp;
  if (position.createdAt.equals(BigInt.fromI32(0))) {
    position.createdAt = event.block.timestamp;
  }
  position.save();

  // Update pool
  pool.totalStaked = pool.totalStaked.plus(event.params.amount);
  pool.lastUpdatedAt = event.block.timestamp;
  pool.save();

  // Update user
  user.totalStaked = user.totalStaked.plus(event.params.amount);
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Create incentive event
  let incentiveEvent = new IncentiveEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  incentiveEvent.pool = pool.id;
  incentiveEvent.user = user.id;
  incentiveEvent.eventType = "STAKE";
  incentiveEvent.amount = event.params.amount;
  incentiveEvent.lockTier = event.params.tier;
  incentiveEvent.lockEndTime = event.params.lockEndTime;
  incentiveEvent.timestamp = event.block.timestamp;
  incentiveEvent.blockNumber = event.block.number;
  incentiveEvent.transactionHash = event.transaction.hash;
  incentiveEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalStaked = stats.totalStaked.plus(event.params.amount);
  stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1));
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleIncentiveUnstaked(event: UnstakedEvent): void {
  let pool = getOrCreateIncentivePool(event.params.poolId);
  let position = getOrCreateIncentivePosition(pool, event.params.user);
  let user = getOrCreateUser(event.params.user);

  // Update position
  position.amount = position.amount.minus(event.params.amount);
  position.lastUpdatedAt = event.block.timestamp;
  position.save();

  // Update pool
  pool.totalStaked = pool.totalStaked.minus(event.params.amount);
  pool.lastUpdatedAt = event.block.timestamp;
  pool.save();

  // Update user
  user.totalStaked = user.totalStaked.minus(event.params.amount);
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Create incentive event
  let incentiveEvent = new IncentiveEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  incentiveEvent.pool = pool.id;
  incentiveEvent.user = user.id;
  incentiveEvent.eventType = "UNSTAKE";
  incentiveEvent.amount = event.params.amount;
  incentiveEvent.timestamp = event.block.timestamp;
  incentiveEvent.blockNumber = event.block.number;
  incentiveEvent.transactionHash = event.transaction.hash;
  incentiveEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalStaked = stats.totalStaked.minus(event.params.amount);
  stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1));
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleIncentiveRewardClaimed(event: RewardClaimedEvent): void {
  let pool = getOrCreateIncentivePool(event.params.poolId);
  let position = getOrCreateIncentivePosition(pool, event.params.user);
  let user = getOrCreateUser(event.params.user);

  // Update position
  position.pendingRewards = BigInt.fromI32(0);
  position.lastUpdatedAt = event.block.timestamp;
  position.save();

  // Update user
  user.totalRewardsEarned = user.totalRewardsEarned.plus(event.params.reward);
  user.totalZakatPaid = user.totalZakatPaid.plus(event.params.zakat);
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Create incentive event
  let incentiveEvent = new IncentiveEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  incentiveEvent.pool = pool.id;
  incentiveEvent.user = user.id;
  incentiveEvent.eventType = "CLAIM";
  incentiveEvent.amount = event.params.reward;
  incentiveEvent.rewards = event.params.reward;
  incentiveEvent.zakat = event.params.zakat;
  incentiveEvent.timestamp = event.block.timestamp;
  incentiveEvent.blockNumber = event.block.number;
  incentiveEvent.transactionHash = event.transaction.hash;
  incentiveEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalRewardsDistributed = stats.totalRewardsDistributed.plus(event.params.reward);
  stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1));
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleIncentiveRewardCompounded(event: RewardCompoundedEvent): void {
  let pool = getOrCreateIncentivePool(event.params.poolId);
  let position = getOrCreateIncentivePosition(pool, event.params.user);
  let user = getOrCreateUser(event.params.user);

  // Update position
  position.amount = position.amount.plus(event.params.amount);
  position.pendingRewards = BigInt.fromI32(0);
  position.lastUpdatedAt = event.block.timestamp;
  position.save();

  // Update pool
  pool.totalStaked = pool.totalStaked.plus(event.params.amount);
  pool.lastUpdatedAt = event.block.timestamp;
  pool.save();

  // Update user
  user.totalStaked = user.totalStaked.plus(event.params.amount);
  user.totalRewardsEarned = user.totalRewardsEarned.plus(event.params.amount);
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Create incentive event
  let incentiveEvent = new IncentiveEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  incentiveEvent.pool = pool.id;
  incentiveEvent.user = user.id;
  incentiveEvent.eventType = "COMPOUND";
  incentiveEvent.amount = event.params.amount;
  incentiveEvent.rewards = event.params.amount;
  incentiveEvent.timestamp = event.block.timestamp;
  incentiveEvent.blockNumber = event.block.number;
  incentiveEvent.transactionHash = event.transaction.hash;
  incentiveEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalStaked = stats.totalStaked.plus(event.params.amount);
  stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1));
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleIncentiveZakatDistributed(event: ZakatDistributedEvent): void {
  // Create zakat distribution
  let zakat = new ZakatDistribution(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  zakat.fund = event.params.fund;
  zakat.amount = event.params.amount;
  zakat.source = "liquidity-incentives";
  zakat.timestamp = event.block.timestamp;
  zakat.blockNumber = event.block.number;
  zakat.transactionHash = event.transaction.hash;
  zakat.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalZakatDistributed = stats.totalZakatDistributed.plus(event.params.amount);
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleEmergencyWithdraw(event: EmergencyWithdrawEvent): void {
  let pool = getOrCreateIncentivePool(event.params.poolId);
  let position = getOrCreateIncentivePosition(pool, event.params.user);
  let user = getOrCreateUser(event.params.user);

  // Update pool
  pool.totalStaked = pool.totalStaked.minus(event.params.amount);
  pool.lastUpdatedAt = event.block.timestamp;
  pool.save();

  // Reset position
  position.amount = BigInt.fromI32(0);
  position.rewardDebt = BigInt.fromI32(0);
  position.pendingRewards = BigInt.fromI32(0);
  position.lockEndTime = BigInt.fromI32(0);
  position.lockTier = 0;
  position.lastUpdatedAt = event.block.timestamp;
  position.save();

  // Update user
  user.totalStaked = user.totalStaked.minus(event.params.amount);
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Create incentive event
  let incentiveEvent = new IncentiveEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  incentiveEvent.pool = pool.id;
  incentiveEvent.user = user.id;
  incentiveEvent.eventType = "EMERGENCY_WITHDRAW";
  incentiveEvent.amount = event.params.amount;
  incentiveEvent.timestamp = event.block.timestamp;
  incentiveEvent.blockNumber = event.block.number;
  incentiveEvent.transactionHash = event.transaction.hash;
  incentiveEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalStaked = stats.totalStaked.minus(event.params.amount);
  stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1));
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

// ═══════════════════════════════════════════════════════════════════════════════
// FREQUENCY ALIGNMENT: 528Hz + 963Hz + 888Hz + 777Hz = ∞
// ALLĀHU AKBAR! 🕋🔥💎🌌
// ═══════════════════════════════════════════════════════════════════════════════
