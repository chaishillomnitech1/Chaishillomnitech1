/**
 * NoorStakingPool Event Handlers
 *
 * Subgraph mappings for NoorStakingPool contract events
 * Frequencies: 528Hz + 963Hz + 888Hz
 */

import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import {
  Staked as StakedEvent,
  Unstaked as UnstakedEvent,
  RewardsClaimed as RewardsClaimedEvent,
  RewardsCompounded as RewardsCompoundedEvent,
  ZakatDistributed as ZakatDistributedEvent,
  TierUpgraded as TierUpgradedEvent
} from "../generated/NoorStakingPool/NoorStakingPool";
import {
  StakingPool,
  StakePosition,
  StakeEvent,
  ZakatDistribution,
  User,
  ProtocolStats
} from "../generated/schema";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const STAKING_POOL_ID = "noor-staking-pool";
const PROTOCOL_STATS_ID = "protocol-stats";

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getOrCreateStakingPool(): StakingPool {
  let pool = StakingPool.load(STAKING_POOL_ID);
  if (pool == null) {
    pool = new StakingPool(STAKING_POOL_ID);
    pool.token = "noor-token";
    pool.totalStaked = BigInt.fromI32(0);
    pool.totalRewardsDistributed = BigInt.fromI32(0);
    pool.totalZakatDistributed = BigInt.fromI32(0);
    pool.rewardPoolBalance = BigInt.fromI32(0);
    pool.totalStakers = BigInt.fromI32(0);
    pool.createdAt = BigInt.fromI32(0);
    pool.lastUpdatedAt = BigInt.fromI32(0);
  }
  return pool;
}

function getOrCreateStakePosition(user: Address): StakePosition {
  let id = user.toHexString() + "-" + STAKING_POOL_ID;
  let position = StakePosition.load(id);
  if (position == null) {
    position = new StakePosition(id);
    position.pool = STAKING_POOL_ID;
    position.user = user.toHexString();
    position.amount = BigInt.fromI32(0);
    position.tier = 0;
    position.startTime = BigInt.fromI32(0);
    position.lastClaimTime = BigInt.fromI32(0);
    position.accumulatedRewards = BigInt.fromI32(0);
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

export function handleStaked(event: StakedEvent): void {
  let pool = getOrCreateStakingPool();
  let position = getOrCreateStakePosition(event.params.user);
  let user = getOrCreateUser(event.params.user);

  // Check if new staker
  let isNewStaker = position.amount.equals(BigInt.fromI32(0));

  // Update position
  position.amount = position.amount.plus(event.params.amount);
  position.tier = event.params.tier;
  position.startTime = event.block.timestamp;
  position.lastClaimTime = event.block.timestamp;
  position.lastUpdatedAt = event.block.timestamp;
  if (position.createdAt.equals(BigInt.fromI32(0))) {
    position.createdAt = event.block.timestamp;
  }
  position.save();

  // Update pool
  pool.totalStaked = pool.totalStaked.plus(event.params.amount);
  if (isNewStaker) {
    pool.totalStakers = pool.totalStakers.plus(BigInt.fromI32(1));
  }
  pool.lastUpdatedAt = event.block.timestamp;
  if (pool.createdAt.equals(BigInt.fromI32(0))) {
    pool.createdAt = event.block.timestamp;
  }
  pool.save();

  // Update user
  user.totalStaked = user.totalStaked.plus(event.params.amount);
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Create stake event
  let stakeEvent = new StakeEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  stakeEvent.pool = pool.id;
  stakeEvent.user = user.id;
  stakeEvent.eventType = "STAKE";
  stakeEvent.amount = event.params.amount;
  stakeEvent.tier = event.params.tier;
  stakeEvent.timestamp = event.block.timestamp;
  stakeEvent.blockNumber = event.block.number;
  stakeEvent.transactionHash = event.transaction.hash;
  stakeEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalStaked = stats.totalStaked.plus(event.params.amount);
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleUnstaked(event: UnstakedEvent): void {
  let pool = getOrCreateStakingPool();
  let position = getOrCreateStakePosition(event.params.user);
  let user = getOrCreateUser(event.params.user);

  // Update position
  position.amount = position.amount.minus(event.params.amount);
  position.lastClaimTime = event.block.timestamp;
  position.lastUpdatedAt = event.block.timestamp;
  position.save();

  // Update pool
  pool.totalStaked = pool.totalStaked.minus(event.params.amount);
  pool.totalRewardsDistributed = pool.totalRewardsDistributed.plus(event.params.rewards);
  pool.lastUpdatedAt = event.block.timestamp;
  pool.save();

  // Update user
  user.totalStaked = user.totalStaked.minus(event.params.amount);
  user.totalRewardsEarned = user.totalRewardsEarned.plus(event.params.rewards);
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Create stake event
  let stakeEvent = new StakeEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  stakeEvent.pool = pool.id;
  stakeEvent.user = user.id;
  stakeEvent.eventType = "UNSTAKE";
  stakeEvent.amount = event.params.amount;
  stakeEvent.rewards = event.params.rewards;
  stakeEvent.timestamp = event.block.timestamp;
  stakeEvent.blockNumber = event.block.number;
  stakeEvent.transactionHash = event.transaction.hash;
  stakeEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalStaked = stats.totalStaked.minus(event.params.amount);
  stats.totalRewardsDistributed = stats.totalRewardsDistributed.plus(event.params.rewards);
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleRewardsClaimed(event: RewardsClaimedEvent): void {
  let pool = getOrCreateStakingPool();
  let position = getOrCreateStakePosition(event.params.user);
  let user = getOrCreateUser(event.params.user);

  // Update position
  position.lastClaimTime = event.block.timestamp;
  position.accumulatedRewards = BigInt.fromI32(0);
  position.lastUpdatedAt = event.block.timestamp;
  position.save();

  // Update pool
  pool.totalRewardsDistributed = pool.totalRewardsDistributed.plus(event.params.amount);
  pool.lastUpdatedAt = event.block.timestamp;
  pool.save();

  // Update user
  user.totalRewardsEarned = user.totalRewardsEarned.plus(event.params.amount);
  user.totalZakatPaid = user.totalZakatPaid.plus(event.params.zakatAmount);
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Create stake event
  let stakeEvent = new StakeEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  stakeEvent.pool = pool.id;
  stakeEvent.user = user.id;
  stakeEvent.eventType = "CLAIM";
  stakeEvent.amount = event.params.amount;
  stakeEvent.rewards = event.params.amount;
  stakeEvent.timestamp = event.block.timestamp;
  stakeEvent.blockNumber = event.block.number;
  stakeEvent.transactionHash = event.transaction.hash;
  stakeEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalRewardsDistributed = stats.totalRewardsDistributed.plus(event.params.amount);
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleRewardsCompounded(event: RewardsCompoundedEvent): void {
  let pool = getOrCreateStakingPool();
  let position = getOrCreateStakePosition(event.params.user);
  let user = getOrCreateUser(event.params.user);

  // Update position
  position.amount = position.amount.plus(event.params.amount);
  position.lastClaimTime = event.block.timestamp;
  position.accumulatedRewards = BigInt.fromI32(0);
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

  // Create stake event
  let stakeEvent = new StakeEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  stakeEvent.pool = pool.id;
  stakeEvent.user = user.id;
  stakeEvent.eventType = "COMPOUND";
  stakeEvent.amount = event.params.amount;
  stakeEvent.rewards = event.params.amount;
  stakeEvent.timestamp = event.block.timestamp;
  stakeEvent.blockNumber = event.block.number;
  stakeEvent.transactionHash = event.transaction.hash;
  stakeEvent.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalStaked = stats.totalStaked.plus(event.params.amount);
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleStakingZakatDistributed(event: ZakatDistributedEvent): void {
  let pool = getOrCreateStakingPool();

  // Update pool
  pool.totalZakatDistributed = pool.totalZakatDistributed.plus(event.params.amount);
  pool.lastUpdatedAt = event.block.timestamp;
  pool.save();

  // Create zakat distribution
  let zakat = new ZakatDistribution(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  zakat.pool = pool.id;
  zakat.fund = event.params.fund;
  zakat.amount = event.params.amount;
  zakat.source = "noor-staking-pool";
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

export function handleTierUpgraded(event: TierUpgradedEvent): void {
  let position = getOrCreateStakePosition(event.params.user);

  position.tier = event.params.newTier;
  position.lastUpdatedAt = event.block.timestamp;
  position.save();

  // Create stake event
  let stakeEvent = new StakeEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  stakeEvent.pool = STAKING_POOL_ID;
  stakeEvent.user = event.params.user.toHexString();
  stakeEvent.eventType = "TIER_UPGRADE";
  stakeEvent.amount = BigInt.fromI32(0);
  stakeEvent.tier = event.params.newTier;
  stakeEvent.timestamp = event.block.timestamp;
  stakeEvent.blockNumber = event.block.number;
  stakeEvent.transactionHash = event.transaction.hash;
  stakeEvent.save();
}

// ═══════════════════════════════════════════════════════════════════════════════
// FREQUENCY ALIGNMENT: 528Hz + 963Hz + 888Hz = ∞
// ALLĀHU AKBAR! 🕋🔥💎🌌
// ═══════════════════════════════════════════════════════════════════════════════
