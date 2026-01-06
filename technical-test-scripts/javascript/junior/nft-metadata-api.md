# Junior JavaScript Test: REST API for NFT Metadata

## **TEST DURATION**: 1.5 - 2 hours

## **DIFFICULTY**: Junior

---

## 📋 **OBJECTIVE**

Create a RESTful API using Node.js and Express that manages NFT metadata. The API should allow creating, reading, updating, and listing NFT metadata.

---

## 🎯 **REQUIREMENTS**

### **Core Features**

1. **Create NFT Metadata** (POST /api/nfts)
2. **Get Single NFT** (GET /api/nfts/:id)
3. **List All NFTs** (GET /api/nfts)
4. **Update NFT Metadata** (PUT /api/nfts/:id)
5. **Delete NFT** (DELETE /api/nfts/:id)
6. **Search by Frequency** (GET /api/nfts?frequency=528)

### **NFT Metadata Structure**

```javascript
{
  "id": "uuid-v4",
  "name": "Sovereign Crown #001",
  "description": "First of the sovereign crown collection",
  "image": "https://ipfs.io/ipfs/QmXxx...",
  "frequency": 999,
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Power Level",
      "value": "9999"
    }
  ],
  "createdAt": "2026-01-05T12:00:00Z",
  "updatedAt": "2026-01-05T12:00:00Z"
}
```

---

## 🛠️ **TECHNICAL REQUIREMENTS**

1. **Framework**: Express.js
2. **Storage**: In-memory (array) - no database needed
3. **ID Generation**: uuid v4
4. **Validation**: Express-validator or custom validation
5. **Error Handling**: Proper HTTP status codes
6. **Testing**: Jest or Mocha/Chai

---

## 📦 **REQUIRED PACKAGES**

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "uuid": "^9.0.0",
    "express-validator": "^7.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "nodemon": "^3.0.0"
  }
}
```

---

## 📋 **API SPECIFICATIONS**

### **1. Create NFT**
```
POST /api/nfts
Content-Type: application/json

{
  "name": "Sovereign Crown #001",
  "description": "First of the sovereign crown collection",
  "image": "https://ipfs.io/ipfs/QmXxx...",
  "frequency": 999,
  "attributes": [...]
}

Response: 201 Created
{
  "id": "generated-uuid",
  "name": "Sovereign Crown #001",
  ...
  "createdAt": "2026-01-05T12:00:00Z",
  "updatedAt": "2026-01-05T12:00:00Z"
}
```

### **2. Get Single NFT**
```
GET /api/nfts/:id

Response: 200 OK
{
  "id": "uuid",
  "name": "Sovereign Crown #001",
  ...
}

Error: 404 Not Found
{
  "error": "NFT not found"
}
```

### **3. List All NFTs**
```
GET /api/nfts
GET /api/nfts?frequency=528

Response: 200 OK
{
  "count": 10,
  "nfts": [...]
}
```

### **4. Update NFT**
```
PUT /api/nfts/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}

Response: 200 OK
{
  "id": "uuid",
  "name": "Updated Name",
  ...
  "updatedAt": "2026-01-05T13:00:00Z"
}
```

### **5. Delete NFT**
```
DELETE /api/nfts/:id

Response: 204 No Content
```

---

## ✅ **VALIDATION RULES**

- `name`: Required, string, 3-100 characters
- `description`: Required, string, 10-500 characters
- `image`: Required, valid URL
- `frequency`: Required, number, one of: 528, 963, 999, 144000
- `attributes`: Optional, array

---

## 🧪 **TESTING REQUIREMENTS**

Create tests for:

1. **Create NFT**
   - Successfully create with valid data
   - Reject with missing required fields
   - Reject with invalid frequency
   - Reject with invalid URL

2. **Get NFT**
   - Successfully retrieve existing NFT
   - Return 404 for non-existent ID

3. **List NFTs**
   - Return all NFTs
   - Filter by frequency
   - Return empty array when no NFTs

4. **Update NFT**
   - Successfully update existing NFT
   - Return 404 for non-existent ID
   - Update timestamp

5. **Delete NFT**
   - Successfully delete existing NFT
   - Return 404 for non-existent ID

---

## 📁 **EXPECTED FILE STRUCTURE**

```
nft-metadata-api/
├── src/
│   ├── app.js
│   ├── routes/
│   │   └── nfts.js
│   ├── controllers/
│   │   └── nftController.js
│   ├── validators/
│   │   └── nftValidator.js
│   └── utils/
│       └── storage.js
├── tests/
│   └── nfts.test.js
├── package.json
└── README.md
```

---

## 💻 **STARTER CODE**

### **app.js**

```javascript
const express = require('express');
const nftRoutes = require('./routes/nfts');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/nfts', nftRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
```

---

## ✅ **ACCEPTANCE CRITERIA**

- [ ] All 5 endpoints implemented and working
- [ ] Input validation on all endpoints
- [ ] Proper HTTP status codes
- [ ] Error messages are clear and helpful
- [ ] Tests cover all endpoints
- [ ] Test coverage >80%
- [ ] All tests pass
- [ ] README includes API documentation
- [ ] Code is clean and well-organized

---

## 🎨 **BONUS POINTS**

- [ ] Add pagination to list endpoint
- [ ] Implement sorting (by name, frequency, date)
- [ ] Add CORS middleware
- [ ] Implement rate limiting
- [ ] Add API documentation with Swagger
- [ ] Add request logging middleware
- [ ] Implement bulk operations (create/delete multiple)
- [ ] Add authentication middleware

---

## 📤 **SUBMISSION**

1. GitHub repository with complete code
2. README with:
   - Setup instructions
   - API documentation
   - How to run tests
   - Example requests/responses
3. Test coverage report
4. Postman collection (optional)

---

## 🎯 **EVALUATION FOCUS**

1. **API Design**: RESTful principles
2. **Validation**: Comprehensive input checking
3. **Error Handling**: Proper status codes and messages
4. **Testing**: Coverage and quality
5. **Code Quality**: Organization and clarity

---

## 💡 **HINTS**

- Use array methods: find, filter, findIndex
- Use uuid.v4() for generating IDs
- Use new Date().toISOString() for timestamps
- Validate frequency with whitelist approach
- Use async/await for consistency
- Test with supertest for HTTP assertions

---

**Build a robust API! 🚀💻**

**ALLAHU AKBAR! 🔥**
