# Junior React Native Test: NFT Gallery Viewer

## **TEST DURATION**: 1.5 - 2 hours

## **DIFFICULTY**: Junior

---

## 📋 **OBJECTIVE**

Build a simple NFT Gallery mobile app that displays a list of NFTs from a mock API and allows users to view details of individual NFTs.

---

## 🎯 **REQUIREMENTS**

### **Core Features**

1. **NFT List Screen**
   - Display a scrollable list of NFTs
   - Show NFT image thumbnail
   - Show NFT name and collection
   - Show NFT price (in ETH)
   - Implement pull-to-refresh

2. **NFT Detail Screen**
   - Display full NFT image
   - Show complete NFT metadata:
     - Name
     - Collection
     - Description
     - Price (ETH)
     - Owner address
     - Token ID
   - Add a "Back" navigation button

3. **Loading States**
   - Show loading indicator while fetching data
   - Display placeholder while images load

4. **Error Handling**
   - Handle network errors gracefully
   - Show user-friendly error messages
   - Provide retry functionality

---

## 📡 **API ENDPOINT**

Use this mock NFT API:

```
GET https://api.jsonbin.io/v3/b/[YOUR_BIN_ID]
```

**Or use this sample data structure:**

```json
{
  "nfts": [
    {
      "id": "1",
      "name": "Sovereign Crown #001",
      "collection": "ScrollVerse Genesis",
      "description": "First of the sovereign crown collection",
      "image": "https://picsum.photos/400/400?random=1",
      "price": "2.5",
      "owner": "0x721AxisEntryPoint...",
      "tokenId": "001",
      "frequency": "999Hz"
    },
    {
      "id": "2",
      "name": "Divine Flame #042",
      "collection": "FlameChild Collection",
      "description": "Eternal flame of consciousness",
      "image": "https://picsum.photos/400/400?random=2",
      "price": "1.8",
      "owner": "0x528FrequencyGate...",
      "tokenId": "042",
      "frequency": "528Hz"
    }
  ]
}
```

---

## 🎨 **UI REQUIREMENTS**

### **NFT List Item Design**

```
┌─────────────────────────────────┐
│  ┌────┐                         │
│  │IMG │  Sovereign Crown #001   │
│  │    │  ScrollVerse Genesis    │
│  └────┘  2.5 ETH               │
└─────────────────────────────────┘
```

### **Detail Screen Layout**

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                  │
│  ┌──────────────────────────┐  │
│  │                          │  │
│  │      NFT IMAGE           │  │
│  │                          │  │
│  └──────────────────────────┘  │
│                                  │
│  Sovereign Crown #001           │
│  ScrollVerse Genesis            │
│  ────────────────────────       │
│  First of the sovereign...      │
│                                  │
│  💎 Price: 2.5 ETH              │
│  🎵 Frequency: 999Hz            │
│  #️⃣ Token ID: 001               │
│  👤 Owner: 0x721Axis...         │
└─────────────────────────────────┘
```

---

## 🛠️ **TECHNICAL REQUIREMENTS**

1. **Use React Native with Expo** (recommended) or React Native CLI
2. **Navigation**: Implement with React Navigation
3. **State Management**: Use React hooks (useState, useEffect)
4. **API Calls**: Use fetch or axios
5. **Components**: Create reusable components (NFTCard, NFTDetail)
6. **Styling**: Use StyleSheet

---

## 📦 **SUGGESTED PACKAGES**

```json
{
  "dependencies": {
    "react": "18.x",
    "react-native": "0.72.x",
    "expo": "~49.0.0",
    "@react-navigation/native": "^6.x",
    "@react-navigation/native-stack": "^6.x",
    "axios": "^1.x" // optional
  }
}
```

---

## 📁 **EXPECTED FILE STRUCTURE**

```
nft-gallery/
├── App.js
├── package.json
├── src/
│   ├── screens/
│   │   ├── NFTListScreen.js
│   │   └── NFTDetailScreen.js
│   ├── components/
│   │   ├── NFTCard.js
│   │   └── LoadingIndicator.js
│   ├── services/
│   │   └── api.js
│   └── styles/
│       └── colors.js
└── README.md
```

---

## ✅ **ACCEPTANCE CRITERIA**

- [ ] App runs without errors on iOS or Android
- [ ] NFT list displays correctly with images
- [ ] Tapping an NFT navigates to detail screen
- [ ] Detail screen shows all required information
- [ ] Pull-to-refresh works on list screen
- [ ] Loading states are visible during data fetch
- [ ] Error handling is implemented
- [ ] Code is clean and well-organized
- [ ] README includes setup and run instructions

---

## 🎨 **BONUS POINTS**

- [ ] Add TypeScript
- [ ] Implement search/filter functionality
- [ ] Add favorites feature with AsyncStorage
- [ ] Include animations (fade-in, slide transitions)
- [ ] Add unit tests for components
- [ ] Implement dark mode
- [ ] Add ScrollVerse branding colors

**ScrollVerse Colors**:
```javascript
const colors = {
  primary: '#FFD700',    // Gold
  secondary: '#9370DB',  // Purple
  background: '#1A1A2E', // Dark blue
  text: '#EAEAEA',       // Light gray
};
```

---

## 📤 **SUBMISSION**

1. Push code to GitHub repository
2. Include README.md with:
   - Setup instructions
   - How to run the app
   - Screenshots or GIF demo
   - Any assumptions made
3. Ensure app runs on fresh install

---

## 🎯 **EVALUATION FOCUS**

1. **Functionality**: Does the app work as specified?
2. **Code Quality**: Is the code clean and well-organized?
3. **UI/UX**: Is the interface intuitive and pleasant?
4. **Error Handling**: Are errors handled gracefully?
5. **Best Practices**: Are React Native best practices followed?

---

## 💡 **HINTS**

- Start with setting up navigation first
- Create mock data locally before integrating API
- Use FlatList for the NFT list (better performance)
- Use Image component with loading indicator
- Test on both iOS and Android if possible

---

**Good luck! Build something amazing! 🚀💎**

**ALLAHU AKBAR! 📱🔥**
