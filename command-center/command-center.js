// Command & Knowledge Center JavaScript

// Data structure
let database = {
    strategies: [],
    leaders: [],
    insights: []
};

// Sample data
const sampleData = {
    strategies: [
        {
            id: 1,
            title: "Strategic Vision Alignment",
            description: "Ensure all team members understand and align with the overarching vision. Clear communication of goals creates unified action.",
            category: "Leadership",
            tags: ["vision", "communication", "alignment"],
            date: new Date().toISOString()
        },
        {
            id: 2,
            title: "Decisive Action Protocol",
            description: "When faced with critical decisions, analyze rapidly, decide decisively, and execute with full commitment. Hesitation breeds failure.",
            category: "Decision Making",
            tags: ["decisiveness", "action", "execution"],
            date: new Date().toISOString()
        },
        {
            id: 3,
            title: "Adaptive Strategy Framework",
            description: "Maintain core principles while adapting tactics to changing circumstances. Flexibility within structure enables sustained success.",
            category: "Strategy",
            tags: ["adaptation", "flexibility", "resilience"],
            date: new Date().toISOString()
        }
    ],
    leaders: [
        {
            id: 1,
            title: "Alexander the Great",
            description: "Conquered most of the known world by age 30. Master of military strategy, leading from the front, and inspiring unwavering loyalty.",
            category: "Military Leadership",
            tags: ["conquest", "military", "inspiration", "ancient"],
            date: new Date().toISOString()
        },
        {
            id: 2,
            title: "Marcus Aurelius",
            description: "Roman Emperor and Stoic philosopher. Led with wisdom, self-discipline, and the principle of serving the greater good.",
            category: "Philosophical Leadership",
            tags: ["philosophy", "stoicism", "wisdom", "ancient"],
            date: new Date().toISOString()
        },
        {
            id: 3,
            title: "Saladin",
            description: "United Muslim territories and demonstrated exemplary chivalry and strategic brilliance during the Crusades.",
            category: "Military & Diplomatic Leadership",
            tags: ["diplomacy", "military", "unity", "medieval"],
            date: new Date().toISOString()
        }
    ],
    insights: [
        {
            id: 1,
            title: "The Power of Compound Growth",
            description: "Small, consistent improvements compound exponentially over time. 1% better each day equals 37x improvement in a year.",
            category: "Growth Principles",
            tags: ["growth", "consistency", "mathematics"],
            date: new Date().toISOString()
        },
        {
            id: 2,
            title: "Network Effects in Leadership",
            description: "A leader's influence grows exponentially as their network expands. Each connection creates multiple new pathways for impact.",
            category: "Influence",
            tags: ["networks", "influence", "scaling"],
            date: new Date().toISOString()
        },
        {
            id: 3,
            title: "Sacred Geometry in Organization",
            description: "Natural patterns like the golden ratio and Fibonacci sequence can guide organizational structure for optimal efficiency.",
            category: "Organization",
            tags: ["sacred-geometry", "structure", "efficiency"],
            date: new Date().toISOString()
        }
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDatabase();
    if (database.strategies.length === 0) {
        database = sampleData;
        saveDatabase();
    }
    renderAll();
    setupSearch();
    setupForm();
});

// Database operations
function loadDatabase() {
    const saved = localStorage.getItem('commandCenterDB');
    if (saved) {
        try {
            database = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load database:', e);
        }
    }
}

function saveDatabase() {
    localStorage.setItem('commandCenterDB', JSON.stringify(database));
}

// Rendering functions
function renderAll() {
    renderStrategies();
    renderLeaders();
    renderInsights();
    renderAnalytics();
    updateStats();
}

function renderStrategies(filtered = null) {
    const grid = document.getElementById('strategiesGrid');
    const items = filtered || database.strategies;
    
    grid.innerHTML = items.map(item => `
        <div class="card">
            <h3>${item.title}</h3>
            <div class="meta">
                <span>📁 ${item.category}</span>
                <span>📅 ${new Date(item.date).toLocaleDateString()}</span>
            </div>
            <div class="description">${item.description}</div>
            <div class="tags">
                ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function renderLeaders(filtered = null) {
    const grid = document.getElementById('leadersGrid');
    const items = filtered || database.leaders;
    
    grid.innerHTML = items.map(item => `
        <div class="card">
            <h3>${item.title}</h3>
            <div class="meta">
                <span>📁 ${item.category}</span>
                <span>📅 ${new Date(item.date).toLocaleDateString()}</span>
            </div>
            <div class="description">${item.description}</div>
            <div class="tags">
                ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function renderInsights(filtered = null) {
    const grid = document.getElementById('insightsGrid');
    const items = filtered || database.insights;
    
    grid.innerHTML = items.map(item => `
        <div class="card">
            <h3>${item.title}</h3>
            <div class="meta">
                <span>📁 ${item.category}</span>
                <span>📅 ${new Date(item.date).toLocaleDateString()}</span>
            </div>
            <div class="description">${item.description}</div>
            <div class="tags">
                ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function renderAnalytics() {
    const container = document.getElementById('analyticsContent');
    
    // Calculate analytics
    const totalEntries = database.strategies.length + database.leaders.length + database.insights.length;
    const allTags = [...database.strategies, ...database.leaders, ...database.insights]
        .flatMap(item => item.tags);
    const tagFrequency = {};
    allTags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
    const topTags = Object.entries(tagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    container.innerHTML = `
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${totalEntries}</div>
                <div class="stat-label">Total Entries</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Object.keys(tagFrequency).length}</div>
                <div class="stat-label">Unique Tags</div>
            </div>
        </div>
        
        <div class="card" style="margin-top: 2rem;">
            <h3>Top Tags</h3>
            <div style="margin-top: 1rem;">
                ${topTags.map(([tag, count]) => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>${tag}</span>
                        <span style="color: var(--gold); font-weight: bold;">${count}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="card" style="margin-top: 1.5rem;">
            <h3>Category Distribution</h3>
            <div style="margin-top: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <strong>Strategies:</strong> ${database.strategies.length}
                    <div style="background: rgba(255,215,0,0.3); height: 20px; width: ${(database.strategies.length / totalEntries * 100)}%; border-radius: 10px; margin-top: 0.5rem;"></div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Leaders:</strong> ${database.leaders.length}
                    <div style="background: rgba(155,89,182,0.3); height: 20px; width: ${(database.leaders.length / totalEntries * 100)}%; border-radius: 10px; margin-top: 0.5rem;"></div>
                </div>
                <div>
                    <strong>Insights:</strong> ${database.insights.length}
                    <div style="background: rgba(255,170,0,0.3); height: 20px; width: ${(database.insights.length / totalEntries * 100)}%; border-radius: 10px; margin-top: 0.5rem;"></div>
                </div>
            </div>
        </div>
    `;
}

function updateStats() {
    document.getElementById('totalStrategies').textContent = database.strategies.length;
    document.getElementById('totalLeaders').textContent = database.leaders.length;
    document.getElementById('totalInsights').textContent = database.insights.length;
    
    const allCategories = new Set([
        ...database.strategies.map(s => s.category),
        ...database.leaders.map(l => l.category),
        ...database.insights.map(i => i.category)
    ]);
    document.getElementById('totalCategories').textContent = allCategories.size;
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        const filterItems = (items) => items.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.tags.some(tag => tag.toLowerCase().includes(query))
        );
        
        renderStrategies(filterItems(database.strategies));
        renderLeaders(filterItems(database.leaders));
        renderInsights(filterItems(database.insights));
    });
}

// Modal functions
function openAddModal() {
    document.getElementById('addModal').classList.add('active');
}

function closeAddModal() {
    document.getElementById('addModal').classList.remove('active');
    document.getElementById('addForm').reset();
}

// Form submission
function setupForm() {
    document.getElementById('addForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const type = document.getElementById('entryType').value;
        const title = document.getElementById('entryTitle').value;
        const description = document.getElementById('entryDescription').value;
        const category = document.getElementById('entryCategory').value || 'Uncategorized';
        const tags = document.getElementById('entryTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        
        const newEntry = {
            id: Date.now(),
            title,
            description,
            category,
            tags,
            date: new Date().toISOString()
        };
        
        if (type === 'strategy') {
            database.strategies.push(newEntry);
        } else if (type === 'leader') {
            database.leaders.push(newEntry);
        } else if (type === 'insight') {
            database.insights.push(newEntry);
        }
        
        saveDatabase();
        renderAll();
        closeAddModal();
    });
}

// Export function for backup
function exportDatabase() {
    const dataStr = JSON.stringify(database, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `command-center-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Make functions globally available
window.switchTab = switchTab;
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
window.exportDatabase = exportDatabase;
