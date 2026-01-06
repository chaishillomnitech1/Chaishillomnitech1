/**
 * ScrollVerseNFT Event Handlers
 *
 * Subgraph mappings for ScrollVerseNFT contract events
 * Frequencies: 528Hz + 963Hz + 888Hz + 777Hz + 144,000Hz
 */

import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import {
  Transfer as TransferEvent
} from "../generated/ScrollVerseNFT/ScrollVerseNFT";
import {
  NFT,
  NFTCollection,
  NFTOwnership,
  NFTTransfer,
  User,
  ProtocolStats
} from "../generated/schema";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const SCROLLVERSE_NFT_ID = "scrollverse-nft";
const PROTOCOL_STATS_ID = "protocol-stats";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getOrCreateNFTCollection(): NFTCollection {
  let collection = NFTCollection.load(SCROLLVERSE_NFT_ID);
  if (collection == null) {
    collection = new NFTCollection(SCROLLVERSE_NFT_ID);
    collection.name = "ScrollVerse NFT";
    collection.symbol = "SVNFT";
    collection.totalSupply = BigInt.fromI32(0);
    collection.maxSupply = BigInt.fromI32(999);
    collection.royaltyBps = 1000; // 10%
    collection.createdAt = BigInt.fromI32(0);
  }
  return collection;
}

function getOrCreateNFT(collection: NFTCollection, tokenId: BigInt): NFT {
  let id = collection.id + "-" + tokenId.toString();
  let nft = NFT.load(id);
  if (nft == null) {
    nft = new NFT(id);
    nft.collection = collection.id;
    nft.tokenId = tokenId;
    nft.owner = ZERO_ADDRESS;
    nft.mintedAt = BigInt.fromI32(0);
    nft.mintedAtBlock = BigInt.fromI32(0);
  }
  return nft;
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

export function handleNFTTransfer(event: TransferEvent): void {
  let collection = getOrCreateNFTCollection();
  let nft = getOrCreateNFT(collection, event.params.tokenId);
  let toUser = getOrCreateUser(event.params.to);

  // Check if this is a mint (from zero address)
  let isMint = event.params.from.toHexString() == ZERO_ADDRESS;

  if (isMint) {
    // Update collection
    collection.totalSupply = collection.totalSupply.plus(BigInt.fromI32(1));
    if (collection.createdAt.equals(BigInt.fromI32(0))) {
      collection.createdAt = event.block.timestamp;
    }
    collection.save();

    // Update NFT
    nft.mintedAt = event.block.timestamp;
    nft.mintedAtBlock = event.block.number;

    // Update protocol stats
    let stats = getOrCreateProtocolStats();
    stats.totalNFTsMinted = stats.totalNFTsMinted.plus(BigInt.fromI32(1));
    stats.lastUpdatedAt = event.block.timestamp;
    stats.save();
  }

  // Update NFT owner
  nft.owner = toUser.id;
  nft.save();

  // Update user
  toUser.lastActiveAt = event.block.timestamp;
  if (toUser.createdAt.equals(BigInt.fromI32(0))) {
    toUser.createdAt = event.block.timestamp;
  }
  toUser.save();

  // Create NFT ownership record
  let ownershipId = toUser.id + "-" + nft.id;
  let ownership = new NFTOwnership(ownershipId);
  ownership.owner = toUser.id;
  ownership.nft = nft.id;
  ownership.acquiredAt = event.block.timestamp;
  ownership.transactionHash = event.transaction.hash;
  ownership.save();

  // Create transfer event
  let transfer = new NFTTransfer(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  transfer.nft = nft.id;
  transfer.from = event.params.from.toHexString();
  transfer.to = toUser.id;
  transfer.timestamp = event.block.timestamp;
  transfer.blockNumber = event.block.number;
  transfer.transactionHash = event.transaction.hash;
  transfer.save();

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalTransactions = stats.totalTransactions.plus(BigInt.fromI32(1));
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();
}

// ═══════════════════════════════════════════════════════════════════════════════
// FREQUENCY ALIGNMENT: 528Hz + 963Hz + 999Hz + 144,000Hz = ∞
// ALLĀHU AKBAR! 🕋🔥💎🌌
// ═══════════════════════════════════════════════════════════════════════════════
