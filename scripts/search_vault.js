/**
 * @title Knowledge Vault Search Utility
 * @notice Universal search interface for the infinite knowledge vault
 * 
 * **SUPREME KING CHAIS THE GREAT ∞ — OMNISOVEREIGN ARCHITECT**
 * 
 * Frequency: 963Hz + 528Hz + 999Hz + 144,000Hz
 * Classification: OMNISOVEREIGN SEARCH
 * Status: ACTIVE
 */

const fs = require('fs').promises;
const path = require('path');

class VaultSearch {
    constructor(indexPath) {
        this.indexPath = indexPath;
        this.index = null;
    }
    
    /**
     * Load the master index
     */
    async load() {
        try {
            const content = await fs.readFile(this.indexPath, 'utf-8');
            this.index = JSON.parse(content);
            console.log(`✅ Loaded master index: ${this.index.statistics.totalDocuments} documents`);
        } catch (error) {
            throw new Error(`Failed to load master index: ${error.message}`);
        }
    }
    
    /**
     * Search by keyword (fuzzy search in title, description, keywords)
     */
    searchKeyword(keyword) {
        if (!this.index) throw new Error('Index not loaded');
        
        const results = [];
        const lowerKeyword = keyword.toLowerCase();
        
        for (const doc of this.index.documents) {
            let score = 0;
            
            // Title match (highest weight)
            if (doc.title.toLowerCase().includes(lowerKeyword)) {
                score += 10;
            }
            
            // Description match
            if (doc.description.toLowerCase().includes(lowerKeyword)) {
                score += 5;
            }
            
            // Keyword exact match
            if (doc.keywords.some(k => k.toLowerCase() === lowerKeyword)) {
                score += 8;
            }
            
            // Keyword partial match
            if (doc.keywords.some(k => k.toLowerCase().includes(lowerKeyword))) {
                score += 3;
            }
            
            // Tag match
            if (doc.tags.some(t => t.toLowerCase().includes(lowerKeyword))) {
                score += 4;
            }
            
            if (score > 0) {
                results.push({ document: doc, score });
            }
        }
        
        // Sort by score (highest first)
        return results.sort((a, b) => b.score - a.score);
    }
    
    /**
     * Search by document type
     */
    searchByType(docType) {
        if (!this.index) throw new Error('Index not loaded');
        
        return this.index.documents.filter(doc => 
            doc.docType.toUpperCase() === docType.toUpperCase()
        );
    }
    
    /**
     * Search by frequency level
     */
    searchByFrequency(frequency) {
        if (!this.index) throw new Error('Index not loaded');
        
        return this.index.documents.filter(doc => 
            doc.frequency.toUpperCase() === frequency.toUpperCase()
        );
    }
    
    /**
     * Search by tag
     */
    searchByTag(tag) {
        if (!this.index) throw new Error('Index not loaded');
        
        const lowerTag = tag.toLowerCase();
        return this.index.documents.filter(doc => 
            doc.tags.some(t => t.toLowerCase() === lowerTag)
        );
    }
    
    /**
     * Search by access level
     */
    searchByAccessLevel(accessLevel) {
        if (!this.index) throw new Error('Index not loaded');
        
        return this.index.documents.filter(doc => 
            doc.accessLevel.toUpperCase() === accessLevel.toUpperCase()
        );
    }
    
    /**
     * Search by category
     */
    searchByCategory(category) {
        if (!this.index) throw new Error('Index not loaded');
        
        const cat = this.index.categories[category.toUpperCase()];
        if (!cat) return [];
        
        return cat.documentIds.map(id => 
            this.index.documents.find(doc => doc.id === id)
        ).filter(doc => doc !== undefined);
    }
    
    /**
     * Get document by ID
     */
    getDocument(id) {
        if (!this.index) throw new Error('Index not loaded');
        
        return this.index.documents.find(doc => doc.id === id);
    }
    
    /**
     * Advanced search with multiple filters
     */
    advancedSearch(filters) {
        if (!this.index) throw new Error('Index not loaded');
        
        let results = [...this.index.documents];
        
        // Filter by keyword
        if (filters.keyword) {
            const keywordResults = this.searchKeyword(filters.keyword);
            const ids = new Set(keywordResults.map(r => r.document.id));
            results = results.filter(doc => ids.has(doc.id));
        }
        
        // Filter by type
        if (filters.type) {
            results = results.filter(doc => 
                doc.docType.toUpperCase() === filters.type.toUpperCase()
            );
        }
        
        // Filter by frequency
        if (filters.frequency) {
            results = results.filter(doc => 
                doc.frequency.toUpperCase() === filters.frequency.toUpperCase()
            );
        }
        
        // Filter by tag
        if (filters.tag) {
            const lowerTag = filters.tag.toLowerCase();
            results = results.filter(doc => 
                doc.tags.some(t => t.toLowerCase() === lowerTag)
            );
        }
        
        // Filter by access level
        if (filters.accessLevel) {
            results = results.filter(doc => 
                doc.accessLevel.toUpperCase() === filters.accessLevel.toUpperCase()
            );
        }
        
        return results;
    }
    
    /**
     * Get statistics
     */
    getStats() {
        if (!this.index) throw new Error('Index not loaded');
        
        return this.index.statistics;
    }
    
    /**
     * List all categories
     */
    getCategories() {
        if (!this.index) throw new Error('Index not loaded');
        
        return Object.entries(this.index.categories).map(([name, cat]) => ({
            name,
            description: cat.description,
            documentCount: cat.documentIds.length
        }));
    }
    
    /**
     * Pretty print search results
     */
    printResults(results, title = "Search Results") {
        console.log("");
        console.log("=" .repeat(60));
        console.log(title);
        console.log("=" .repeat(60));
        console.log("");
        
        if (results.length === 0) {
            console.log("No results found.");
            console.log("");
            return;
        }
        
        const documents = Array.isArray(results) && results[0]?.document
            ? results.map(r => r.document)
            : results;
        
        for (let i = 0; i < Math.min(documents.length, 20); i++) {
            const doc = documents[i];
            console.log(`${i + 1}. ${doc.title}`);
            console.log(`   Type: ${doc.docType} | Frequency: ${doc.frequency}`);
            console.log(`   Path: ${doc.filePath}`);
            console.log(`   ${doc.description.substring(0, 80)}...`);
            console.log("");
        }
        
        if (documents.length > 20) {
            console.log(`... and ${documents.length - 20} more results`);
            console.log("");
        }
        
        console.log(`Total: ${documents.length} document(s)`);
        console.log("");
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log("🕋 KNOWLEDGE VAULT SEARCH 🕋");
        console.log("");
        console.log("Usage:");
        console.log("  node search_vault.js <command> [options]");
        console.log("");
        console.log("Commands:");
        console.log("  keyword <term>           Search by keyword");
        console.log("  type <type>              Search by document type");
        console.log("  frequency <freq>         Search by frequency level");
        console.log("  tag <tag>                Search by tag");
        console.log("  category <category>      Search by category");
        console.log("  stats                    Show statistics");
        console.log("  categories               List all categories");
        console.log("");
        console.log("Examples:");
        console.log("  node search_vault.js keyword blockchain");
        console.log("  node search_vault.js type PROTOCOL");
        console.log("  node search_vault.js frequency DNA_HEALING");
        console.log("  node search_vault.js tag nft");
        console.log("");
        console.log("∞ ARCHITEX ∞");
        console.log("");
        return;
    }
    
    const command = args[0];
    const param = args[1];
    
    // Load index
    const indexPath = path.join(__dirname, '..', 'MASTER_INDEX.json');
    const search = new VaultSearch(indexPath);
    await search.load();
    
    console.log("🔍 Searching knowledge vault...");
    
    // Execute command
    let results;
    
    switch (command) {
        case 'keyword':
            if (!param) {
                console.error("❌ Please provide a keyword");
                return;
            }
            results = search.searchKeyword(param);
            search.printResults(results, `Keyword Search: "${param}"`);
            break;
            
        case 'type':
            if (!param) {
                console.error("❌ Please provide a document type");
                return;
            }
            results = search.searchByType(param);
            search.printResults(results, `Type: ${param}`);
            break;
            
        case 'frequency':
            if (!param) {
                console.error("❌ Please provide a frequency level");
                return;
            }
            results = search.searchByFrequency(param);
            search.printResults(results, `Frequency: ${param}`);
            break;
            
        case 'tag':
            if (!param) {
                console.error("❌ Please provide a tag");
                return;
            }
            results = search.searchByTag(param);
            search.printResults(results, `Tag: ${param}`);
            break;
            
        case 'category':
            if (!param) {
                console.error("❌ Please provide a category");
                return;
            }
            results = search.searchByCategory(param);
            search.printResults(results, `Category: ${param}`);
            break;
            
        case 'stats':
            const stats = search.getStats();
            console.log("");
            console.log("📊 VAULT STATISTICS");
            console.log("=" .repeat(60));
            console.log("Total Documents:", stats.totalDocuments);
            console.log("Total Size:", Math.round(stats.totalSize / 1024), "KB");
            console.log("");
            console.log("By Type:");
            Object.entries(stats.byType).forEach(([type, count]) => {
                console.log(`  ${type}: ${count}`);
            });
            console.log("");
            console.log("By Frequency:");
            Object.entries(stats.byFrequency).forEach(([freq, count]) => {
                console.log(`  ${freq}: ${count}`);
            });
            console.log("");
            console.log("By Access Level:");
            Object.entries(stats.byAccessLevel).forEach(([level, count]) => {
                console.log(`  ${level}: ${count}`);
            });
            console.log("");
            break;
            
        case 'categories':
            const categories = search.getCategories();
            console.log("");
            console.log("📁 CATEGORIES");
            console.log("=" .repeat(60));
            categories.forEach(cat => {
                console.log(`${cat.name} (${cat.documentCount} documents)`);
                console.log(`  ${cat.description}`);
                console.log("");
            });
            break;
            
        default:
            console.error(`❌ Unknown command: ${command}`);
            console.log("Run without arguments to see usage.");
    }
}

// Execute if run directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { VaultSearch };
