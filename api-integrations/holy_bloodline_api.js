/**
 * @title Holy Bloodline API Integration
 * @dev API integration script for Holy Bloodline system
 * @author Supreme King Chais The Great ∞
 * 
 * This module provides easy-to-use functions for integrating
 * the Holy Bloodline system into web applications and APIs.
 */

const { ethers } = require('ethers');

// Contract ABIs (import from artifacts in production)
const HOLY_BLOODLINE_NFT_ABI = require('../artifacts/contracts/HolyBloodlineNFT.sol/HolyBloodlineNFT.json').abi;
const TRUTH_COIN_ABI = require('../artifacts/contracts/TruthCoin.sol/TruthCoin.json').abi;
const PROSPERITY_COIN_ABI = require('../artifacts/contracts/ProsperityCoin.sol/ProsperityCoin.json').abi;
const LOVE_COIN_ABI = require('../artifacts/contracts/LoveCoin.sol/LoveCoin.json').abi;
const SPIRITUAL_PORTAL_ABI = require('../artifacts/contracts/SpiritualActivationPortal.sol/SpiritualActivationPortal.json').abi;

class HolyBloodlineAPI {
    /**
     * Initialize the API with contract addresses and provider
     */
    constructor(config) {
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.signer = config.privateKey 
            ? new ethers.Wallet(config.privateKey, this.provider)
            : null;

        // Initialize contracts
        this.nft = new ethers.Contract(
            config.addresses.nft,
            HOLY_BLOODLINE_NFT_ABI,
            this.signer || this.provider
        );

        this.truthCoin = new ethers.Contract(
            config.addresses.truth,
            TRUTH_COIN_ABI,
            this.signer || this.provider
        );

        this.prosperityCoin = new ethers.Contract(
            config.addresses.prosperity,
            PROSPERITY_COIN_ABI,
            this.signer || this.provider
        );

        this.loveCoin = new ethers.Contract(
            config.addresses.love,
            LOVE_COIN_ABI,
            this.signer || this.provider
        );

        this.portal = new ethers.Contract(
            config.addresses.portal,
            SPIRITUAL_PORTAL_ABI,
            this.signer || this.provider
        );
    }

    // ============ NFT FUNCTIONS ============

    /**
     * Get NFT information
     */
    async getNFTInfo(tokenId) {
        const info = await this.nft.getNFTInfo(tokenId);
        return {
            chapter: info.chapter,
            activated: info.activated,
            activatedAt: Number(info.activatedAt),
            alignment: Number(info.alignment),
            frequency: Number(info.frequency),
            messageCount: Number(info.messageCount)
        };
    }

    /**
     * Get NFT owner
     */
    async getNFTOwner(tokenId) {
        return await this.nft.ownerOf(tokenId);
    }

    /**
     * Get messages for NFT
     */
    async getNFTMessages(tokenId) {
        return await this.nft.getMessages(tokenId);
    }

    /**
     * Get divine affirmation
     */
    async getAffirmation() {
        return await this.nft.getAffirmation();
    }

    /**
     * Activate NFT (requires signer)
     */
    async activateNFT(tokenId) {
        if (!this.signer) throw new Error('Signer required for this operation');
        const tx = await this.nft.activateNFT(tokenId);
        return await tx.wait();
    }

    // ============ TOKEN BALANCE FUNCTIONS ============

    /**
     * Get Truth Coin balance
     */
    async getTruthBalance(address) {
        const balance = await this.truthCoin.balanceOf(address);
        return ethers.formatEther(balance);
    }

    /**
     * Get Prosperity Coin balance
     */
    async getProsperityBalance(address) {
        const balance = await this.prosperityCoin.balanceOf(address);
        return ethers.formatEther(balance);
    }

    /**
     * Get Love Coin balance
     */
    async getLoveBalance(address) {
        const balance = await this.loveCoin.balanceOf(address);
        return ethers.formatEther(balance);
    }

    /**
     * Get all coin balances
     */
    async getAllBalances(address) {
        return {
            truth: await this.getTruthBalance(address),
            prosperity: await this.getProsperityBalance(address),
            love: await this.getLoveBalance(address)
        };
    }

    // ============ USER STATS FUNCTIONS ============

    /**
     * Get Truth Coin user statistics
     */
    async getTruthStats(address) {
        const stats = await this.truthCoin.getUserStats(address);
        return {
            totalRewards: ethers.formatEther(stats.totalRewards),
            lastClaim: Number(stats.lastClaim),
            journals: Number(stats.journals),
            meditations: Number(stats.meditations),
            alignment: Number(stats.alignment)
        };
    }

    /**
     * Get Prosperity Coin user statistics
     */
    async getProsperityStats(address) {
        const stats = await this.prosperityCoin.getUserStats(address);
        return {
            totalRewards: ethers.formatEther(stats.totalRewards),
            lastClaim: Number(stats.lastClaim),
            affirmations: Number(stats.affirmations),
            wealthLevel: Number(stats.wealthLevel),
            generosity: Number(stats.generosity)
        };
    }

    /**
     * Get Love Coin user statistics
     */
    async getLoveStats(address) {
        const stats = await this.loveCoin.getUserStats(address);
        return {
            totalRewards: ethers.formatEther(stats.totalRewards),
            lastClaim: Number(stats.lastClaim),
            heartMeditations: Number(stats.heartMeditations),
            compassion: Number(stats.compassion),
            unity: Number(stats.unity),
            forgiveness: Number(stats.forgiveness)
        };
    }

    // ============ PORTAL FUNCTIONS ============

    /**
     * Activate portal for user
     */
    async activatePortal() {
        if (!this.signer) throw new Error('Signer required for this operation');
        const tx = await this.portal.activatePortal();
        return await tx.wait();
    }

    /**
     * Get portal user statistics
     */
    async getPortalStats(address) {
        const stats = await this.portal.getUserStats(address);
        return {
            reflections: Number(stats.reflections),
            achievements: Number(stats.achievements),
            alignment: Number(stats.alignment),
            lastActivity: Number(stats.lastActivityTime),
            portalAccess: stats.portalAccess
        };
    }

    /**
     * Log a reflection (requires signer)
     */
    async logReflection(text) {
        if (!this.signer) throw new Error('Signer required for this operation');
        const tx = await this.portal.logReflection(text);
        return await tx.wait();
    }

    /**
     * Record an achievement (requires signer)
     */
    async recordAchievement(description, category, alignmentPoints) {
        if (!this.signer) throw new Error('Signer required for this operation');
        const tx = await this.portal.recordAchievement(description, category, alignmentPoints);
        return await tx.wait();
    }

    /**
     * Record meditation session (requires signer)
     */
    async recordMeditation(type, sessionCount) {
        if (!this.signer) throw new Error('Signer required for this operation');
        const tx = await this.portal.recordMeditation(type, sessionCount);
        return await tx.wait();
    }

    /**
     * Record compassion action (requires signer)
     */
    async recordCompassion(actions) {
        if (!this.signer) throw new Error('Signer required for this operation');
        const tx = await this.portal.recordCompassion(actions);
        return await tx.wait();
    }

    /**
     * Record unity practice (requires signer)
     */
    async recordUnity(practices) {
        if (!this.signer) throw new Error('Signer required for this operation');
        const tx = await this.portal.recordUnity(practices);
        return await tx.wait();
    }

    /**
     * Record affirmation (requires signer)
     */
    async recordAffirmation(count) {
        if (!this.signer) throw new Error('Signer required for this operation');
        const tx = await this.portal.recordAffirmation(count);
        return await tx.wait();
    }

    /**
     * Record generosity (requires signer)
     */
    async recordGenerosity(acts) {
        if (!this.signer) throw new Error('Signer required for this operation');
        const tx = await this.portal.recordGenerosity(acts);
        return await tx.wait();
    }

    /**
     * Get user reflections (paginated)
     */
    async getUserReflections(address, offset = 0, limit = 10) {
        return await this.portal.getUserReflections(address, offset, limit);
    }

    /**
     * Get user achievements (paginated)
     */
    async getUserAchievements(address, offset = 0, limit = 10) {
        const achievements = await this.portal.getUserAchievements(address, offset, limit);
        return achievements.map(a => ({
            description: a.description,
            category: a.category,
            timestamp: Number(a.timestamp),
            alignmentPoints: Number(a.alignmentPoints)
        }));
    }

    // ============ COMPREHENSIVE USER DASHBOARD ============

    /**
     * Get complete user dashboard data
     */
    async getUserDashboard(address) {
        const [
            balances,
            truthStats,
            prosperityStats,
            loveStats,
            portalStats,
            reflections,
            achievements
        ] = await Promise.all([
            this.getAllBalances(address),
            this.getTruthStats(address),
            this.getProsperityStats(address),
            this.getLoveStats(address),
            this.getPortalStats(address),
            this.getUserReflections(address, 0, 5),
            this.getUserAchievements(address, 0, 5)
        ]);

        return {
            address,
            balances,
            stats: {
                truth: truthStats,
                prosperity: prosperityStats,
                love: loveStats,
                portal: portalStats
            },
            recentReflections: reflections,
            recentAchievements: achievements
        };
    }
}

// ============ USAGE EXAMPLE ============

async function example() {
    const api = new HolyBloodlineAPI({
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        privateKey: process.env.PRIVATE_KEY, // Optional, for write operations
        addresses: {
            nft: '0x...',
            truth: '0x...',
            prosperity: '0x...',
            love: '0x...',
            portal: '0x...'
        }
    });

    // Get user dashboard
    const userAddress = '0x...';
    const dashboard = await api.getUserDashboard(userAddress);
    console.log('User Dashboard:', dashboard);

    // Log a reflection (requires signer)
    if (api.signer) {
        await api.logReflection('Today I aligned with divine truth and felt the resonance of infinite love.');
        console.log('Reflection logged! Earned 10 TRUTH tokens.');
    }

    // Record meditation
    if (api.signer) {
        await api.recordMeditation('HEART', 1);
        console.log('Heart meditation recorded! Earned 52 LOVE tokens.');
    }
}

module.exports = HolyBloodlineAPI;

// For testing: node api-integrations/holy_bloodline_api.js
if (require.main === module) {
    example().catch(console.error);
}
