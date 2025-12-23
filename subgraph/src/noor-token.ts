/**
 * NoorToken Event Handlers
 *
 * Subgraph mappings for NoorToken contract events
 * Frequencies: 528Hz + 963Hz + 888Hz
 */

import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import {
  Transfer as TransferEvent,
  ZakatDistributed as ZakatDistributedEvent,
  FeeCollected as FeeCollectedEvent,
  CitizenStatusUpdated as CitizenStatusUpdatedEvent
} from "../generated/NoorToken/NoorToken";
import {
  Token,
  User,
  Transfer,
  ZakatDistribution,
  ProtocolStats
} from "../generated/schema";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const NOOR_TOKEN_ID = "noor-token";
const PROTOCOL_STATS_ID = "protocol-stats";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getOrCreateToken(): Token {
  let token = Token.load(NOOR_TOKEN_ID);
  if (token == null) {
    token = new Token(NOOR_TOKEN_ID);
    token.name = "Noor Token";
    token.symbol = "NOOR";
    token.decimals = 18;
    token.totalSupply = BigInt.fromI32(0);
    token.totalTransfers = BigInt.fromI32(0);
    token.totalHolders = BigInt.fromI32(0);
    token.totalVolume = BigInt.fromI32(0);
    token.createdAt = BigInt.fromI32(0);
    token.createdAtBlock = BigInt.fromI32(0);
  }
  return token;
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

    // Update protocol stats
    let stats = getOrCreateProtocolStats();
    stats.totalUsers = stats.totalUsers.plus(BigInt.fromI32(1));
    stats.save();
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

export function handleNoorTransfer(event: TransferEvent): void {
  let token = getOrCreateToken();

  // Skip zero address (mint/burn)
  if (event.params.from.toHexString() != ZERO_ADDRESS) {
    let fromUser = getOrCreateUser(event.params.from);
    fromUser.noorBalance = fromUser.noorBalance.minus(event.params.value);
    fromUser.lastActiveAt = event.block.timestamp;
    fromUser.save();
  } else {
    // Minting - update total supply
    token.totalSupply = token.totalSupply.plus(event.params.value);
  }

  if (event.params.to.toHexString() != ZERO_ADDRESS) {
    let toUser = getOrCreateUser(event.params.to);
    toUser.noorBalance = toUser.noorBalance.plus(event.params.value);
    toUser.lastActiveAt = event.block.timestamp;
    toUser.save();
  } else {
    // Burning - update total supply
    token.totalSupply = token.totalSupply.minus(event.params.value);
  }

  // Create transfer entity
  let transfer = new Transfer(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  transfer.token = token.id;
  transfer.from = event.params.from.toHexString();
  transfer.to = event.params.to.toHexString();
  transfer.amount = event.params.value;
  transfer.timestamp = event.block.timestamp;
  transfer.blockNumber = event.block.number;
  transfer.transactionHash = event.transaction.hash;
  transfer.save();

  // Update token stats
  token.totalTransfers = token.totalTransfers.plus(BigInt.fromI32(1));
  token.totalVolume = token.totalVolume.plus(event.params.value);
  token.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1));
  stats.totalVolume = stats.totalVolume.plus(event.params.value);
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

export function handleZakatDistributed(event: ZakatDistributedEvent): void {
  let zakat = new ZakatDistribution(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  zakat.fund = event.params.to;
  zakat.amount = event.params.amount;
  zakat.source = "noor-token";
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

export function handleFeeCollected(event: FeeCollectedEvent): void {
  let user = getOrCreateUser(event.params.from);
  user.lastActiveAt = event.block.timestamp;
  user.save();

  // Fee is already accounted for in transfers
}

export function handleCitizenStatusUpdated(event: CitizenStatusUpdatedEvent): void {
  let user = getOrCreateUser(event.params.citizen);
  user.isNoorCitizen = event.params.status;
  user.lastActiveAt = event.block.timestamp;
  user.save();
}

// ═══════════════════════════════════════════════════════════════════════════════
// FREQUENCY ALIGNMENT: 528Hz + 963Hz + 888Hz = ∞
// ALLĀHU AKBAR! 🕋🔥💎🌌
// ═══════════════════════════════════════════════════════════════════════════════
