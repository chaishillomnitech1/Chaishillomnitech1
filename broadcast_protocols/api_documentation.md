# ScrollVerse Broadcasting API Documentation

## Version 1.0

**Author**: Chais Hill | Chais The Great  
**Organization**: Omnitech1  
**License**: CC BY-NC-SA 4.0

## Base URL

```
Production: https://api.scrollverse.io
Staging: https://api-staging.scrollverse.io
WebSocket: wss://broadcast.scrollverse.io/ws
```

## Authentication

All API requests require authentication using either an API key or JWT token.

### API Key

Include in the request header:
```
Authorization: Bearer YOUR_API_KEY
```

### Obtaining an API Key

```http
POST /v1/auth/api-key
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "My Application"
}
```

Response:
```json
{
  "apiKey": "sv_live_abc123...",
  "expires": "2026-01-01T00:00:00Z",
  "tier": "free"
}
```

## REST API Endpoints

### Events

#### Publish Event

Publish an event to the broadcast network.

```http
POST /v1/events
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "event": "content_release",
  "channel": "content",
  "data": {
    "title": "New Track Release",
    "creator": "Chais The Great",
    "type": "audio",
    "url": "https://...",
    "metadata": {}
  }
}
```

Response:
```json
{
  "success": true,
  "eventId": "evt_123abc",
  "timestamp": 1735689600000,
  "channel": "content",
  "recipients": 1234
}
```

#### Get Event History

Retrieve historical events.

```http
GET /v1/events?channel=content&limit=50&offset=0
Authorization: Bearer YOUR_API_KEY
```

Response:
```json
{
  "events": [
    {
      "id": "evt_123abc",
      "timestamp": 1735689600000,
      "event": "content_release",
      "channel": "content",
      "data": {}
    }
  ],
  "total": 1234,
  "limit": 50,
  "offset": 0
}
```

### Channels

#### List Channels

Get available broadcast channels.

```http
GET /v1/channels
Authorization: Bearer YOUR_API_KEY
```

Response:
```json
{
  "channels": [
    {
      "name": "content",
      "description": "Content releases and updates",
      "subscribers": 5000,
      "public": true
    },
    {
      "name": "nft",
      "description": "NFT minting and trading",
      "subscribers": 3000,
      "public": true
    }
  ]
}
```

#### Create Channel

Create a custom broadcast channel.

```http
POST /v1/channels
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "name": "my-channel",
  "description": "My custom channel",
  "public": true,
  "requirements": {
    "nftGate": {
      "contract": "0x...",
      "minBalance": 1
    }
  }
}
```

Response:
```json
{
  "success": true,
  "channel": {
    "id": "ch_123abc",
    "name": "custom:user123:my-channel",
    "description": "My custom channel",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### Subscribe to Channel

Subscribe to receive events from a channel.

```http
POST /v1/channels/{channelName}/subscribe
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "webhook": "https://your-domain.com/webhook",
  "events": ["content_release", "nft_mint"]
}
```

Response:
```json
{
  "success": true,
  "subscriptionId": "sub_123abc",
  "channel": "content",
  "webhook": "https://your-domain.com/webhook"
}
```

### Webhooks

#### Configure Webhook

Set up a webhook to receive event notifications.

```http
POST /v1/webhooks
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["content_release", "nft_mint"],
  "channels": ["content", "nft"],
  "secret": "your-webhook-secret"
}
```

Response:
```json
{
  "success": true,
  "webhookId": "wh_123abc",
  "url": "https://your-domain.com/webhook",
  "signingSecret": "whsec_abc123..."
}
```

#### Webhook Payload

When an event occurs, a POST request is sent to your webhook URL:

```http
POST https://your-domain.com/webhook
Content-Type: application/json
X-ScrollVerse-Signature: sha256=abc123...
X-ScrollVerse-Event: content_release
X-ScrollVerse-Delivery: del_123abc

{
  "id": "evt_123abc",
  "timestamp": 1735689600000,
  "event": "content_release",
  "channel": "content",
  "data": {
    "title": "New Track Release",
    "creator": "Chais The Great",
    "type": "audio"
  }
}
```

#### Verify Webhook Signature

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

### Analytics

#### Get Channel Statistics

Retrieve analytics for a channel.

```http
GET /v1/analytics/channels/{channelName}?period=7d
Authorization: Bearer YOUR_API_KEY
```

Response:
```json
{
  "channel": "content",
  "period": "7d",
  "metrics": {
    "events": 1234,
    "subscribers": 5000,
    "impressions": 50000,
    "engagement": 0.15
  },
  "timeseries": [
    {
      "timestamp": 1735689600000,
      "events": 50,
      "subscribers": 4950
    }
  ]
}
```

## WebSocket API

### Connection

Connect to the WebSocket server:

```javascript
const ws = new WebSocket('wss://broadcast.scrollverse.io/ws');
```

### Authentication

After connection, authenticate:

```json
{
  "action": "authenticate",
  "apiKey": "YOUR_API_KEY"
}
```

Response:
```json
{
  "action": "authenticated",
  "success": true,
  "userId": "user_123",
  "tier": "pro"
}
```

### Subscribe to Channels

```json
{
  "action": "subscribe",
  "channels": ["content", "nft", "blockchain"],
  "filters": {
    "creator": "Chais The Great",
    "network": "Scroll zkEVM"
  }
}
```

Response:
```json
{
  "action": "subscribed",
  "success": true,
  "channels": ["content", "nft", "blockchain"]
}
```

### Unsubscribe from Channels

```json
{
  "action": "unsubscribe",
  "channels": ["blockchain"]
}
```

Response:
```json
{
  "action": "unsubscribed",
  "success": true,
  "channels": ["blockchain"]
}
```

### Publish Event

```json
{
  "action": "publish",
  "channel": "content",
  "event": "content_release",
  "data": {
    "title": "New Track",
    "creator": "Chais The Great"
  }
}
```

Response:
```json
{
  "action": "published",
  "success": true,
  "eventId": "evt_123abc",
  "recipients": 1234
}
```

### Receiving Events

Events are pushed to the client:

```json
{
  "id": "evt_123abc",
  "timestamp": 1735689600000,
  "channel": "content",
  "event": "content_release",
  "data": {
    "title": "New Track Release",
    "creator": "Chais The Great",
    "type": "audio",
    "url": "https://..."
  }
}
```

### Heartbeat

Keep the connection alive with periodic pings:

Client sends:
```json
{
  "action": "ping"
}
```

Server responds:
```json
{
  "action": "pong",
  "timestamp": 1735689600000
}
```

## SDKs

### JavaScript/TypeScript SDK

```bash
npm install @scrollverse/broadcast-sdk
```

```javascript
import { ScrollVerseBroadcast } from '@scrollverse/broadcast-sdk';

const client = new ScrollVerseBroadcast({
  apiKey: 'YOUR_API_KEY',
  environment: 'production'
});

// Connect to WebSocket
await client.connect();

// Subscribe to channels
client.subscribe(['content', 'nft'], (event) => {
  console.log('Event received:', event);
});

// Publish event
await client.publish('content', {
  event: 'content_release',
  data: {
    title: 'New Track',
    creator: 'Chais The Great'
  }
});
```

### Python SDK

```bash
pip install scrollverse-broadcast
```

```python
from scrollverse import ScrollVerseBroadcast

client = ScrollVerseBroadcast(api_key='YOUR_API_KEY')

# Subscribe to channels
def on_event(event):
    print(f"Event received: {event}")

client.subscribe(['content', 'nft'], on_event)

# Publish event
client.publish('content', {
    'event': 'content_release',
    'data': {
        'title': 'New Track',
        'creator': 'Chais The Great'
    }
})

# Start listening
client.start()
```

## Rate Limits

### Request Limits

| Tier       | Requests/Hour | WebSocket Connections | Events/Day |
|------------|---------------|----------------------|------------|
| Free       | 1,000         | 10                   | 100        |
| Pro        | 100,000       | 100                  | 10,000     |
| Enterprise | Unlimited     | Unlimited            | Unlimited  |

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1735689600
```

### Rate Limit Exceeded

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please try again later.",
    "resetAt": 1735689600000
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid parameters |
| 401  | Unauthorized - Invalid or missing API key |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error |
| 503  | Service Unavailable - Temporary outage |

### Error Response Format

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request is missing required parameters.",
    "details": {
      "missing": ["channel", "event"]
    },
    "requestId": "req_123abc"
  }
}
```

## Best Practices

### Connection Management

1. Implement exponential backoff for reconnections
2. Handle connection drops gracefully
3. Monitor connection health with heartbeats
4. Close connections when not needed

### Event Publishing

1. Validate event data before publishing
2. Include all required fields
3. Use appropriate channel for event type
4. Implement retry logic for failures

### Webhook Security

1. Verify webhook signatures
2. Use HTTPS endpoints only
3. Implement idempotency checks
4. Handle webhook failures with retries

### Performance Optimization

1. Batch events when possible
2. Use filters to reduce unnecessary events
3. Cache channel metadata
4. Monitor API usage and optimize

## Support

- API Status: https://status.scrollverse.io
- Documentation: https://docs.scrollverse.io
- Support Email: support@omnitech1.com
- Discord: https://discord.gg/scrollverse

---

**Licensed under CC BY-NC-SA 4.0**  
**Authored by Chais Hill | Chais The Great**  
**Founder, Omnitech1™ | Architect of the ScrollVerse**
