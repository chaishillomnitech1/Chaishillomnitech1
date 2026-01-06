#!/usr/bin/env python3
"""
OmniTech1 Integration Server
ScrollVerse Genesis Protocol - Sovereign Deployment Engine

This module provides the main Flask server for the OmniTech1 integration,
including:
- GitHub webhook handler with HMAC SHA-256 signature verification
- Admin endpoints with optional token/JWT authentication
- Socket.IO for real-time graph updates
- NetworkX in-memory graph with Neo4j persistence
"""

import os
import hmac
import hashlib
import logging
import functools
from datetime import datetime, timezone
from typing import Optional, Tuple, Any

import jwt
import networkx as nx
from flask import Flask, request, jsonify, render_template, abort
from flask_socketio import SocketIO, emit

from omnitech_persistence import OmnitechPersistence

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', os.urandom(32).hex())

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Initialize in-memory graph
omni_graph = nx.DiGraph()

# Initialize persistence layer (lazy connection)
persistence: Optional[OmnitechPersistence] = None


def get_persistence() -> Optional[OmnitechPersistence]:
    """Get or create the persistence layer."""
    global persistence
    if persistence is None:
        neo4j_uri = os.environ.get('NEO4J_URI')
        neo4j_user = os.environ.get('NEO4J_USER')
        neo4j_password = os.environ.get('NEO4J_PASSWORD')

        if neo4j_uri and neo4j_user and neo4j_password:
            try:
                persistence = OmnitechPersistence(neo4j_uri, neo4j_user, neo4j_password)
                logger.info("Neo4j persistence layer initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Neo4j persistence: {e}")
    return persistence


def verify_webhook_signature(payload: bytes, signature_header: str) -> bool:
    """
    Verify GitHub webhook signature using HMAC SHA-256.

    Args:
        payload: Raw request body bytes
        signature_header: X-Hub-Signature-256 header value

    Returns:
        True if signature is valid, False otherwise
    """
    secret = os.environ.get('GITHUB_WEBHOOK_SECRET')

    if not secret:
        logger.warning("GITHUB_WEBHOOK_SECRET not set - accepting payload without verification")
        return True

    if not signature_header:
        logger.warning("No X-Hub-Signature-256 header present")
        return False

    if not signature_header.startswith('sha256='):
        logger.warning("Invalid signature format - must start with 'sha256='")
        return False

    expected_signature = signature_header[7:]  # Remove 'sha256=' prefix

    # Compute HMAC SHA-256
    computed_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()

    # Use constant-time comparison to prevent timing attacks
    return hmac.compare_digest(computed_signature, expected_signature)


def require_admin_auth(f):
    """
    Decorator for admin endpoint authentication.

    Supports two authentication methods:
    1. Token-based: X-Admin-Token header matches ADMIN_TOKEN env var
    2. JWT-based: Authorization Bearer token signed with JWT_SECRET

    If neither ADMIN_TOKEN nor JWT_SECRET is set, endpoints are unprotected.
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        admin_token = os.environ.get('ADMIN_TOKEN')
        jwt_secret = os.environ.get('JWT_SECRET')

        # If no auth configured, allow access with warning
        if not admin_token and not jwt_secret:
            logger.warning("Admin authentication not configured - endpoint unprotected")
            return f(*args, **kwargs)

        # Try token-based auth first
        request_token = request.headers.get('X-Admin-Token')
        if admin_token and request_token:
            if hmac.compare_digest(request_token, admin_token):
                return f(*args, **kwargs)

        # Try JWT auth
        auth_header = request.headers.get('Authorization')
        if jwt_secret and auth_header:
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
                try:
                    jwt.decode(token, jwt_secret, algorithms=['HS256'])
                    return f(*args, **kwargs)
                except jwt.InvalidTokenError as e:
                    logger.warning(f"Invalid JWT token: {e}")

        abort(401, description="Unauthorized - valid authentication required")

    return decorated


# ============================================================================
# Webhook Endpoints
# ============================================================================

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    """
    Handle incoming GitHub webhooks.

    Verifies X-Hub-Signature-256 HMAC SHA-256 signature when
    GITHUB_WEBHOOK_SECRET is configured. Logs warning if not configured.
    """
    payload = request.get_data()
    signature = request.headers.get('X-Hub-Signature-256', '')

    if not verify_webhook_signature(payload, signature):
        logger.warning("Webhook signature verification failed")
        return jsonify({'error': 'Invalid signature'}), 403

    # Parse and process webhook
    try:
        data = request.get_json() or {}
        event_type = request.headers.get('X-GitHub-Event', 'unknown')

        logger.info(f"Received webhook event: {event_type}")

        # Add node to graph for tracking
        node_id = f"webhook_{datetime.now(timezone.utc).isoformat()}"
        omni_graph.add_node(node_id, event_type=event_type, timestamp=datetime.now(timezone.utc).isoformat())

        # Persist to Neo4j if available
        persist = get_persistence()
        if persist:
            persist.save_node(node_id, {'event_type': event_type, 'timestamp': datetime.now(timezone.utc).isoformat()})

        # Emit real-time update
        socketio.emit('webhook_received', {
            'event_type': event_type,
            'node_id': node_id
        })

        return jsonify({
            'status': 'success',
            'event_type': event_type,
            'node_id': node_id
        }), 200

    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# Admin Endpoints
# ============================================================================

@app.route('/admin/graph', methods=['GET'])
@require_admin_auth
def get_graph():
    """Get the current graph state."""
    nodes = [
        {'id': n, **omni_graph.nodes[n]}
        for n in omni_graph.nodes()
    ]
    edges = [
        {'source': u, 'target': v, **omni_graph.edges[u, v]}
        for u, v in omni_graph.edges()
    ]
    return jsonify({
        'nodes': nodes,
        'edges': edges,
        'node_count': omni_graph.number_of_nodes(),
        'edge_count': omni_graph.number_of_edges()
    })


@app.route('/admin/graph/node', methods=['POST'])
@require_admin_auth
def add_node():
    """Add a node to the graph."""
    data = request.get_json() or {}
    node_id = data.get('id')
    attributes = data.get('attributes', {})

    if not node_id:
        return jsonify({'error': 'Node ID required'}), 400

    omni_graph.add_node(node_id, **attributes)

    # Persist to Neo4j if available
    persist = get_persistence()
    if persist:
        persist.save_node(node_id, attributes)

    socketio.emit('graph_updated', {'action': 'node_added', 'node_id': node_id})

    return jsonify({'status': 'success', 'node_id': node_id}), 201


@app.route('/admin/graph/edge', methods=['POST'])
@require_admin_auth
def add_edge():
    """Add an edge to the graph."""
    data = request.get_json() or {}
    source = data.get('source')
    target = data.get('target')
    attributes = data.get('attributes', {})

    if not source or not target:
        return jsonify({'error': 'Source and target required'}), 400

    omni_graph.add_edge(source, target, **attributes)

    # Persist to Neo4j if available
    persist = get_persistence()
    if persist:
        persist.save_edge(source, target, attributes)

    socketio.emit('graph_updated', {'action': 'edge_added', 'source': source, 'target': target})

    return jsonify({'status': 'success', 'source': source, 'target': target}), 201


@app.route('/admin/status', methods=['GET'])
@require_admin_auth
def admin_status():
    """Get admin status and system health."""
    persist = get_persistence()
    return jsonify({
        'status': 'healthy',
        'graph_nodes': omni_graph.number_of_nodes(),
        'graph_edges': omni_graph.number_of_edges(),
        'neo4j_connected': persist is not None and persist.is_connected(),
        'timestamp': datetime.now(timezone.utc).isoformat()
    })


# ============================================================================
# Web UI Endpoints
# ============================================================================

@app.route('/')
def index():
    """Render the main dashboard."""
    return render_template('index.html')


@app.route('/admin')
def admin_page():
    """Render the admin dashboard."""
    return render_template('admin.html')


@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now(timezone.utc).isoformat()})


# ============================================================================
# Socket.IO Events
# ============================================================================

@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'status': 'connected', 'sid': request.sid})


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    logger.info(f"Client disconnected: {request.sid}")


@socketio.on('subscribe_graph')
def handle_subscribe():
    """Subscribe client to graph updates."""
    emit('graph_state', {
        'nodes': [{'id': n, **omni_graph.nodes[n]} for n in omni_graph.nodes()],
        'edges': [{'source': u, 'target': v} for u, v in omni_graph.edges()]
    })


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'

    logger.info(f"Starting OmniTech1 server on port {port}")

    # Warn about missing security configuration
    if not os.environ.get('GITHUB_WEBHOOK_SECRET'):
        logger.warning("GITHUB_WEBHOOK_SECRET not set - webhook payloads will be accepted without verification")

    if not os.environ.get('ADMIN_TOKEN') and not os.environ.get('JWT_SECRET'):
        logger.warning("No admin authentication configured - admin endpoints will be unprotected")

    socketio.run(app, host='0.0.0.0', port=port, debug=debug)
