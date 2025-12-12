#!/usr/bin/env python3
"""
OmniTech1 Webhook Signature Verification Tests
ScrollVerse Genesis Protocol - Security Tests

Tests for HMAC SHA-256 webhook signature verification.
"""

import hmac
import hashlib
import json
import os
import pytest

# Set up test environment variables before importing the server
os.environ['FLASK_SECRET_KEY'] = 'test-secret-key'

from omnitech_server import app, verify_webhook_signature


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def webhook_secret():
    """Test webhook secret."""
    return 'test-webhook-secret-12345'


def compute_signature(secret: str, payload: bytes) -> str:
    """Compute HMAC SHA-256 signature for a payload."""
    signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    return f'sha256={signature}'


class TestVerifyWebhookSignature:
    """Tests for the verify_webhook_signature function."""

    def test_valid_signature_with_secret(self, webhook_secret, monkeypatch):
        """Test that a valid signature is accepted when secret is set."""
        monkeypatch.setenv('GITHUB_WEBHOOK_SECRET', webhook_secret)

        payload = b'{"event": "push", "ref": "refs/heads/main"}'
        signature = compute_signature(webhook_secret, payload)

        assert verify_webhook_signature(payload, signature) is True

    def test_invalid_signature_with_secret(self, webhook_secret, monkeypatch):
        """Test that an invalid signature is rejected when secret is set."""
        monkeypatch.setenv('GITHUB_WEBHOOK_SECRET', webhook_secret)

        payload = b'{"event": "push", "ref": "refs/heads/main"}'
        invalid_signature = 'sha256=invalid_signature_value'

        assert verify_webhook_signature(payload, invalid_signature) is False

    def test_tampered_payload_rejected(self, webhook_secret, monkeypatch):
        """Test that a tampered payload is rejected."""
        monkeypatch.setenv('GITHUB_WEBHOOK_SECRET', webhook_secret)

        original_payload = b'{"event": "push", "ref": "refs/heads/main"}'
        signature = compute_signature(webhook_secret, original_payload)

        tampered_payload = b'{"event": "push", "ref": "refs/heads/evil"}'

        assert verify_webhook_signature(tampered_payload, signature) is False

    def test_no_secret_accepts_payload(self, monkeypatch):
        """Test that payloads are accepted when no secret is configured."""
        monkeypatch.delenv('GITHUB_WEBHOOK_SECRET', raising=False)

        payload = b'{"event": "push"}'
        signature = 'sha256=any_signature'

        # Should accept and log warning
        assert verify_webhook_signature(payload, signature) is True

    def test_missing_signature_header(self, webhook_secret, monkeypatch):
        """Test that missing signature header is rejected when secret is set."""
        monkeypatch.setenv('GITHUB_WEBHOOK_SECRET', webhook_secret)

        payload = b'{"event": "push"}'

        assert verify_webhook_signature(payload, '') is False

    def test_invalid_signature_format(self, webhook_secret, monkeypatch):
        """Test that signature without sha256= prefix is rejected."""
        monkeypatch.setenv('GITHUB_WEBHOOK_SECRET', webhook_secret)

        payload = b'{"event": "push"}'
        invalid_format = 'invalid_format_signature'

        assert verify_webhook_signature(payload, invalid_format) is False

    def test_empty_payload(self, webhook_secret, monkeypatch):
        """Test signature verification with empty payload."""
        monkeypatch.setenv('GITHUB_WEBHOOK_SECRET', webhook_secret)

        payload = b''
        signature = compute_signature(webhook_secret, payload)

        assert verify_webhook_signature(payload, signature) is True

    def test_large_payload(self, webhook_secret, monkeypatch):
        """Test signature verification with a large payload."""
        monkeypatch.setenv('GITHUB_WEBHOOK_SECRET', webhook_secret)

        payload = b'x' * 1000000  # 1MB payload
        signature = compute_signature(webhook_secret, payload)

        assert verify_webhook_signature(payload, signature) is True


class TestWebhookEndpoint:
    """Integration tests for the /webhook endpoint."""

    def test_webhook_with_valid_signature(self, client, webhook_secret, monkeypatch):
        """Test webhook endpoint accepts valid signature."""
        monkeypatch.setenv('GITHUB_WEBHOOK_SECRET', webhook_secret)

        payload = json.dumps({'event': 'push', 'ref': 'refs/heads/main'}).encode()
        signature = compute_signature(webhook_secret, payload)

        response = client.post(
            '/webhook',
            data=payload,
            content_type='application/json',
            headers={
                'X-Hub-Signature-256': signature,
                'X-GitHub-Event': 'push'
            }
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert data['event_type'] == 'push'

    def test_webhook_with_invalid_signature(self, client, webhook_secret, monkeypatch):
        """Test webhook endpoint rejects invalid signature."""
        monkeypatch.setenv('GITHUB_WEBHOOK_SECRET', webhook_secret)

        payload = json.dumps({'event': 'push'}).encode()
        invalid_signature = 'sha256=invalid'

        response = client.post(
            '/webhook',
            data=payload,
            content_type='application/json',
            headers={
                'X-Hub-Signature-256': invalid_signature,
                'X-GitHub-Event': 'push'
            }
        )

        assert response.status_code == 403

    def test_webhook_without_secret_configured(self, client, monkeypatch):
        """Test webhook accepts any payload when secret not configured."""
        monkeypatch.delenv('GITHUB_WEBHOOK_SECRET', raising=False)

        payload = json.dumps({'event': 'push'}).encode()

        response = client.post(
            '/webhook',
            data=payload,
            content_type='application/json',
            headers={'X-GitHub-Event': 'push'}
        )

        assert response.status_code == 200

    def test_webhook_missing_signature_header(self, client, webhook_secret, monkeypatch):
        """Test webhook rejects request without signature when secret is set."""
        monkeypatch.setenv('GITHUB_WEBHOOK_SECRET', webhook_secret)

        payload = json.dumps({'event': 'push'}).encode()

        response = client.post(
            '/webhook',
            data=payload,
            content_type='application/json',
            headers={'X-GitHub-Event': 'push'}
        )

        assert response.status_code == 403


class TestAdminAuthentication:
    """Tests for admin endpoint authentication."""

    def test_admin_with_valid_token(self, client, monkeypatch):
        """Test admin endpoint accepts valid token."""
        admin_token = 'test-admin-token-12345'
        monkeypatch.setenv('ADMIN_TOKEN', admin_token)

        response = client.get(
            '/admin/status',
            headers={'X-Admin-Token': admin_token}
        )

        assert response.status_code == 200

    def test_admin_with_invalid_token(self, client, monkeypatch):
        """Test admin endpoint rejects invalid token."""
        monkeypatch.setenv('ADMIN_TOKEN', 'correct-token')

        response = client.get(
            '/admin/status',
            headers={'X-Admin-Token': 'wrong-token'}
        )

        assert response.status_code == 401

    def test_admin_without_auth_configured(self, client, monkeypatch):
        """Test admin endpoint is accessible when no auth is configured."""
        monkeypatch.delenv('ADMIN_TOKEN', raising=False)
        monkeypatch.delenv('JWT_SECRET', raising=False)

        response = client.get('/admin/status')

        assert response.status_code == 200

    def test_admin_with_valid_jwt(self, client, monkeypatch):
        """Test admin endpoint accepts valid JWT."""
        import jwt

        jwt_secret = 'test-jwt-secret-12345'
        monkeypatch.setenv('JWT_SECRET', jwt_secret)

        token = jwt.encode({'user': 'admin'}, jwt_secret, algorithm='HS256')

        response = client.get(
            '/admin/status',
            headers={'Authorization': f'Bearer {token}'}
        )

        assert response.status_code == 200

    def test_admin_with_invalid_jwt(self, client, monkeypatch):
        """Test admin endpoint rejects invalid JWT."""
        import jwt

        monkeypatch.setenv('JWT_SECRET', 'correct-secret')

        token = jwt.encode({'user': 'admin'}, 'wrong-secret', algorithm='HS256')

        response = client.get(
            '/admin/status',
            headers={'Authorization': f'Bearer {token}'}
        )

        assert response.status_code == 401


class TestHealthEndpoint:
    """Tests for the health check endpoint."""

    def test_health_returns_ok(self, client):
        """Test health endpoint returns healthy status."""
        response = client.get('/health')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert 'timestamp' in data
