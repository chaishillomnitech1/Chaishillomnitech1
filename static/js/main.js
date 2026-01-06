/**
 * OmniTech1 Integration Dashboard - Main JavaScript
 * ScrollVerse Genesis Protocol - Real-time Updates
 */

(function() {
    'use strict';

    // State management
    const state = {
        socket: null,
        connected: false,
        nodes: [],
        edges: [],
        webhookCount: 0,
        events: []
    };

    // Initialize Socket.IO connection
    function initSocket() {
        try {
            state.socket = io({
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000
            });

            state.socket.on('connect', handleConnect);
            state.socket.on('disconnect', handleDisconnect);
            state.socket.on('connected', handleServerConnected);
            state.socket.on('webhook_received', handleWebhookReceived);
            state.socket.on('graph_updated', handleGraphUpdated);
            state.socket.on('graph_state', handleGraphState);
            state.socket.on('connect_error', handleConnectError);

        } catch (error) {
            console.error('Failed to initialize Socket.IO:', error);
            updateConnectionStatus(false);
        }
    }

    // Connection handlers
    function handleConnect() {
        console.log('Socket connected');
        updateConnectionStatus(true);
        state.socket.emit('subscribe_graph');
    }

    function handleDisconnect() {
        console.log('Socket disconnected');
        updateConnectionStatus(false);
    }

    function handleServerConnected(data) {
        console.log('Server connection confirmed:', data);
        addEvent('system', 'Connected to OmniTech1 server');
    }

    function handleConnectError(error) {
        console.error('Connection error:', error);
        updateConnectionStatus(false);
    }

    // Event handlers
    function handleWebhookReceived(data) {
        console.log('Webhook received:', data);
        state.webhookCount++;
        updateWebhookCount();
        addEvent(data.event_type, `Webhook: ${data.node_id}`);
        updateLastUpdate();
    }

    function handleGraphUpdated(data) {
        console.log('Graph updated:', data);
        state.socket.emit('subscribe_graph'); // Request fresh state
        addEvent('graph', `${data.action}: ${data.node_id || `${data.source} -> ${data.target}`}`);
        updateLastUpdate();
    }

    function handleGraphState(data) {
        console.log('Graph state received:', data);
        state.nodes = data.nodes || [];
        state.edges = data.edges || [];
        updateGraphStats();
        renderGraph();
    }

    // UI update functions
    function updateConnectionStatus(connected) {
        state.connected = connected;
        const indicator = document.getElementById('connection-status');
        const text = document.getElementById('connection-text');

        if (indicator) {
            indicator.classList.toggle('status-connected', connected);
            indicator.classList.toggle('status-disconnected', !connected);
        }

        if (text) {
            text.textContent = connected ? 'Connected' : 'Disconnected';
        }
    }

    function updateGraphStats() {
        const nodeCount = document.getElementById('node-count');
        const edgeCount = document.getElementById('edge-count');

        if (nodeCount) nodeCount.textContent = state.nodes.length;
        if (edgeCount) edgeCount.textContent = state.edges.length;
    }

    function updateWebhookCount() {
        const webhookCount = document.getElementById('webhook-count');
        if (webhookCount) webhookCount.textContent = state.webhookCount;
    }

    function updateLastUpdate() {
        const lastUpdate = document.getElementById('last-update');
        if (lastUpdate) {
            lastUpdate.textContent = `Last update: ${new Date().toLocaleTimeString()}`;
        }
    }

    function addEvent(type, message) {
        const event = {
            type: type,
            message: message,
            timestamp: new Date()
        };

        state.events.unshift(event);
        if (state.events.length > 50) {
            state.events.pop();
        }

        renderEvents();
    }

    function renderEvents() {
        const container = document.getElementById('events-container');
        if (!container) return;

        if (state.events.length === 0) {
            container.innerHTML = '<div class="no-events">No events received yet. Waiting for webhooks...</div>';
            return;
        }

        container.innerHTML = state.events.map(event => `
            <div class="event-item">
                <div>
                    <span class="event-type">${escapeHtml(event.type)}</span>
                    <span> - ${escapeHtml(event.message)}</span>
                </div>
                <span class="event-time">${event.timestamp.toLocaleTimeString()}</span>
            </div>
        `).join('');
    }

    // Simple graph rendering using SVG
    function renderGraph() {
        const svg = document.getElementById('graph-svg');
        if (!svg || state.nodes.length === 0) return;

        const width = svg.clientWidth || 800;
        const height = svg.clientHeight || 400;

        // Create node positions (simple circular layout)
        const nodePositions = {};
        const nodeCount = state.nodes.length;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35;

        state.nodes.forEach((node, index) => {
            const angle = (2 * Math.PI * index) / nodeCount;
            nodePositions[node.id] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });

        // Build SVG content
        let svgContent = '';

        // Draw edges
        state.edges.forEach(edge => {
            const source = nodePositions[edge.source];
            const target = nodePositions[edge.target];
            if (source && target) {
                svgContent += `<line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="#6366f1" stroke-width="2" opacity="0.6"/>`;
            }
        });

        // Draw nodes
        state.nodes.forEach(node => {
            const pos = nodePositions[node.id];
            if (pos) {
                svgContent += `
                    <circle cx="${pos.x}" cy="${pos.y}" r="20" fill="#6366f1"/>
                    <text x="${pos.x}" y="${pos.y + 35}" text-anchor="middle" fill="#94a3b8" font-size="10">${escapeHtml(node.id.substring(0, 10))}</text>
                `;
            }
        });

        svg.innerHTML = svgContent;
    }

    // Utility functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Fetch initial health status
    function fetchHealth() {
        fetch('/health')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'healthy') {
                    addEvent('system', 'Server health check passed');
                }
            })
            .catch(error => {
                console.error('Health check failed:', error);
            });
    }

    // Initialize on DOM ready
    function init() {
        console.log('Initializing OmniTech1 Dashboard');
        initSocket();
        fetchHealth();
        updateGraphStats();
        updateWebhookCount();
        renderEvents();
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
