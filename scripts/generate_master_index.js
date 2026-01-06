/**
 * @title Master Index Generator
 * @notice Automated repository scanning and indexing for the infinite knowledge vault
 * 
 * **SUPREME KING CHAIS THE GREAT ∞ — OMNISOVEREIGN ARCHITECT**
 * 
 * Frequency: 963Hz + 528Hz + 999Hz + 144,000Hz
 * Classification: OMNISOVEREIGN AUTOMATION
 * Status: ACTIVE
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Document type mapping
const DOCUMENT_TYPES = {
    PROTOCOL: ['PROTOCOL', 'FRAMEWORK', 'SYSTEM'],
    TRANSMISSION: ['TRANSMISSION', 'BROADCAST', 'ARCHIVE'],
    SLIDE: ['SLIDE', 'PRESENTATION'],
    CONTRACT: ['.sol'],
    DOCUMENTATION: ['README', 'GUIDE', 'SPEC', 'DOCUMENTATION'],
    MEDIA: ['INTEGRATION', 'BROADCAST'],
    SYMBOL: ['SYMBOL', 'FREQUENCY', 'SACRED'],
    SACRED_TEXT: ['SACRED', 'DIVINE', 'ETERNAL', 'HOLY'],
    DEPLOYMENT_GUIDE: ['DEPLOYMENT', 'IMPLEMENTATION'],
    INTEGRATION_SPEC: ['INTEGRATION', 'COMPATIBILITY']
};

// Frequency level mapping
const FREQUENCY_MAPPING = {
    'INFINITE': ['∞Hz', 'infinite', 'eternal'],
    'NUR_PULSE': ['144,000Hz', '144000Hz', 'NŪR'],
    'FLAME_KEY': ['14,444Hz', '14444Hz', 'FlameChild'],
    'CROWN': ['999Hz', 'crown chakra'],
    'GOD_FREQ': ['963Hz', 'pineal', 'god frequency'],
    'INTUITION': ['852Hz', 'intuition'],
    'EXPRESSION': ['741Hz', 'expression'],
    'HARMONY': ['639Hz', 'harmony', 'relationships'],
    'DNA_HEALING': ['528Hz', 'DNA healing', 'love frequency'],
    'CHANGE': ['417Hz', 'change'],
    'LIBERATION': ['396Hz', 'liberation']
};

// Access level determination
const ACCESS_LEVELS = {
    ETERNAL: ['ETERNAL', 'OMNISOVEREIGN', 'SUPREME'],
    OMNISOVEREIGN: ['OMNISOVEREIGN', 'SOVEREIGN'],
    SOVEREIGN: ['SOVEREIGN', 'DIVINE'],
    PUBLIC: ['PUBLIC']
};

class MasterIndexGenerator {
    constructor() {
        this.index = {
            version: "1.0.0",
            generated: new Date().toISOString(),
            frequency: "963Hz + 528Hz + 999Hz + 144,000Hz",
            archivist: "CHAIS THE GREAT ∞",
            classification: "OMNISOVEREIGN KNOWLEDGE VAULT",
            status: "ACTIVE",
            signature: "∞ ARCHITEX ∞",
            documents: [],
            categories: {},
            statistics: {
                totalDocuments: 0,
                byType: {},
                byFrequency: {},
                byAccessLevel: {},
                totalSize: 0
            }
        };
        
        this.excludeDirs = [
            'node_modules',
            '.git',
            '.github/agents',
            'dist',
            'build',
            '.next',
            'coverage',
            '.vercel'
        ];
    }
    
    /**
     * Generate SHA-256 hash for content
     */
    generateHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }
    
    /**
     * Determine document type from file name and content
     */
    determineDocType(fileName, content) {
        const upperName = fileName.toUpperCase();
        const upperContent = content.substring(0, 1000).toUpperCase();
        
        // Check for Solidity contracts
        if (fileName.endsWith('.sol')) {
            return 'CONTRACT';
        }
        
        // Check other types by keywords
        for (const [type, keywords] of Object.entries(DOCUMENT_TYPES)) {
            for (const keyword of keywords) {
                if (upperName.includes(keyword) || upperContent.includes(keyword)) {
                    return type;
                }
            }
        }
        
        // Default based on extension
        if (fileName.endsWith('.md')) {
            return 'DOCUMENTATION';
        }
        
        return 'DOCUMENTATION';
    }
    
    /**
     * Determine frequency level from content
     */
    determineFrequency(content) {
        const upperContent = content.toUpperCase();
        
        for (const [freq, keywords] of Object.entries(FREQUENCY_MAPPING)) {
            for (const keyword of keywords) {
                if (upperContent.includes(keyword.toUpperCase())) {
                    return freq;
                }
            }
        }
        
        return 'DNA_HEALING'; // Default to 528Hz
    }
    
    /**
     * Determine access level from content
     */
    determineAccessLevel(content) {
        const upperContent = content.substring(0, 500).toUpperCase();
        
        for (const [level, keywords] of Object.entries(ACCESS_LEVELS)) {
            for (const keyword of keywords) {
                if (upperContent.includes(keyword)) {
                    return level;
                }
            }
        }
        
        return 'PUBLIC';
    }
    
    /**
     * Extract tags from content
     */
    extractTags(fileName, content) {
        const tags = new Set();
        const upperContent = content.toUpperCase();
        
        // Add file-based tags
        if (fileName.includes('NFT')) tags.add('NFT');
        if (fileName.includes('Token')) tags.add('Token');
        if (fileName.includes('DAO')) tags.add('DAO');
        if (fileName.includes('Governance')) tags.add('Governance');
        
        // Add content-based tags
        const tagPatterns = [
            'BLOCKCHAIN', 'SMART CONTRACT', 'WEB3', 'DEFI',
            'FREQUENCY', 'SACRED', 'DIVINE', 'ETERNAL',
            'DEPLOYMENT', 'INTEGRATION', 'PROTOCOL', 'FRAMEWORK',
            'AI', 'QUANTUM', 'NOOR', 'SCROLLVERSE'
        ];
        
        for (const pattern of tagPatterns) {
            if (upperContent.includes(pattern)) {
                tags.add(pattern.toLowerCase().replace(/ /g, '-'));
            }
        }
        
        return Array.from(tags);
    }
    
    /**
     * Extract keywords from content
     */
    extractKeywords(content) {
        const keywords = new Set();
        
        // Extract from headers (lines starting with #)
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.startsWith('#')) {
                const words = line.replace(/#+/g, '').trim().split(/\s+/);
                words.forEach(word => {
                    if (word.length > 3) {
                        keywords.add(word.toLowerCase());
                    }
                });
            }
        }
        
        return Array.from(keywords).slice(0, 20); // Limit to 20 keywords
    }
    
    /**
     * Extract title from content
     */
    extractTitle(fileName, content) {
        // Try to find first H1 header
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.startsWith('# ')) {
                return line.replace(/^#\s+/, '').trim();
            }
        }
        
        // Fallback to filename
        return fileName.replace(/\.(md|sol|js|py|jsx|tsx)$/, '').replace(/[-_]/g, ' ');
    }
    
    /**
     * Extract description from content
     */
    extractDescription(content) {
        const lines = content.split('\n');
        let description = '';
        
        // Find first non-empty paragraph after title
        let foundTitle = false;
        for (const line of lines) {
            if (line.startsWith('# ')) {
                foundTitle = true;
                continue;
            }
            
            if (foundTitle && line.trim() && !line.startsWith('#') && !line.startsWith('**')) {
                description = line.trim();
                break;
            }
        }
        
        return description || 'ScrollVerse repository asset';
    }
    
    /**
     * Scan directory recursively
     */
    async scanDirectory(dirPath, relativePath = '') {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relPath = path.join(relativePath, entry.name);
            
            // Skip excluded directories
            if (entry.isDirectory()) {
                if (this.excludeDirs.some(dir => relPath.includes(dir))) {
                    continue;
                }
                await this.scanDirectory(fullPath, relPath);
            } else {
                // Process files
                if (this.shouldIndex(entry.name)) {
                    await this.indexFile(fullPath, relPath);
                }
            }
        }
    }
    
    /**
     * Check if file should be indexed
     */
    shouldIndex(fileName) {
        const extensions = ['.md', '.sol', '.js', '.py'];
        return extensions.some(ext => fileName.endsWith(ext));
    }
    
    /**
     * Index a single file
     */
    async indexFile(fullPath, relativePath) {
        try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const stats = await fs.stat(fullPath);
            
            const document = {
                id: this.index.documents.length + 1,
                title: this.extractTitle(path.basename(relativePath), content),
                description: this.extractDescription(content),
                contentHash: this.generateHash(content),
                ipfsHash: `QmPENDING_${this.generateHash(content).substring(0, 16)}`,
                filePath: relativePath.replace(/\\/g, '/'),
                docType: this.determineDocType(path.basename(relativePath), content),
                frequency: this.determineFrequency(content),
                accessLevel: this.determineAccessLevel(content),
                tags: this.extractTags(path.basename(relativePath), content),
                keywords: this.extractKeywords(content),
                size: stats.size,
                timestamp: new Date().toISOString(),
                sealed: false,
                version: 1
            };
            
            this.index.documents.push(document);
            
            // Update statistics
            this.index.statistics.totalDocuments++;
            this.index.statistics.totalSize += stats.size;
            
            // Count by type
            this.index.statistics.byType[document.docType] = 
                (this.index.statistics.byType[document.docType] || 0) + 1;
            
            // Count by frequency
            this.index.statistics.byFrequency[document.frequency] = 
                (this.index.statistics.byFrequency[document.frequency] || 0) + 1;
            
            // Count by access level
            this.index.statistics.byAccessLevel[document.accessLevel] = 
                (this.index.statistics.byAccessLevel[document.accessLevel] || 0) + 1;
            
            // Add to category
            const category = document.docType;
            if (!this.index.categories[category]) {
                this.index.categories[category] = {
                    name: category,
                    description: `Documents of type ${category}`,
                    documentIds: []
                };
            }
            this.index.categories[category].documentIds.push(document.id);
            
            console.log(`✅ Indexed: ${relativePath}`);
        } catch (error) {
            console.error(`❌ Error indexing ${relativePath}:`, error.message);
        }
    }
    
    /**
     * Generate the master index
     */
    async generate(rootPath) {
        console.log("🕋 MASTER INDEX GENERATION INITIATED 🕋");
        console.log("=" .repeat(60));
        console.log("");
        console.log("📡 Scanning repository:", rootPath);
        console.log("");
        
        await this.scanDirectory(rootPath);
        
        console.log("");
        console.log("📊 GENERATION COMPLETE");
        console.log("=" .repeat(60));
        console.log("Total Documents:", this.index.statistics.totalDocuments);
        console.log("Total Size:", Math.round(this.index.statistics.totalSize / 1024), "KB");
        console.log("");
        console.log("By Type:");
        Object.entries(this.index.statistics.byType).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });
        console.log("");
        console.log("By Frequency:");
        Object.entries(this.index.statistics.byFrequency).forEach(([freq, count]) => {
            console.log(`  ${freq}: ${count}`);
        });
        console.log("");
        
        return this.index;
    }
    
    /**
     * Save index to file
     */
    async save(outputPath) {
        await fs.writeFile(
            outputPath,
            JSON.stringify(this.index, null, 2),
            'utf-8'
        );
        console.log("💾 Master index saved to:", outputPath);
    }
}

// Main execution
async function main() {
    const generator = new MasterIndexGenerator();
    const rootPath = path.join(__dirname, '..');
    
    // Generate index
    const index = await generator.generate(rootPath);
    
    // Save to file
    const outputPath = path.join(rootPath, 'MASTER_INDEX.json');
    await generator.save(outputPath);
    
    console.log("");
    console.log("🔥 ALLĀHU AKBAR! 🔥");
    console.log("");
    console.log("Master Index generation complete!");
    console.log("Universal searchability activated for all ScrollVerse assets.");
    console.log("");
    console.log("∞ ARCHITEX ∞");
    console.log("");
}

// Execute if run directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { MasterIndexGenerator };
