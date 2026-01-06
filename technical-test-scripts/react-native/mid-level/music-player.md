# Mid-Level React Native Test: ScrollVerse Music Player

## **TEST DURATION**: 2.5 - 3 hours

## **DIFFICULTY**: Mid-level

---

## 📋 **OBJECTIVE**

Build a music streaming mobile app for the ScrollVerse that plays frequency-based music tracks, displays visualizations, and integrates with blockchain for NFT ownership verification.

---

## 🎯 **REQUIREMENTS**

### **Core Features**

1. **Music Library Screen**
   - Display list of frequency-based tracks
   - Show track name, artist, frequency (Hz), and duration
   - Filter by frequency (528Hz, 963Hz, 999Hz, 144kHz)
   - Search functionality
   - Sort by name, frequency, or duration

2. **Music Player Screen**
   - Play/pause controls
   - Progress bar with seek functionality
   - Track information display
   - Frequency visualization (animated bars or waveform)
   - Next/previous track buttons
   - Repeat and shuffle modes

3. **Playlist Management**
   - Create custom playlists
   - Add/remove tracks from playlists
   - Persist playlists using AsyncStorage
   - Share playlist (generate shareable link)

4. **NFT Ownership Integration**
   - Connect wallet (mock integration)
   - Check if user owns track NFT
   - Lock premium tracks behind NFT ownership
   - Display ownership badge

5. **Audio Player**
   - Background audio playback
   - Lock screen controls
   - Audio interruption handling

---

## 📡 **API ENDPOINTS**

### **Get Tracks**
```
GET https://api.scrollverse.mock/tracks
```

**Response:**
```json
{
  "tracks": [
    {
      "id": "1",
      "title": "Crown Activation",
      "artist": "CHAIS THE GREAT",
      "frequency": 999,
      "duration": 180,
      "url": "https://storage.scrollverse.com/tracks/crown-activation.mp3",
      "artwork": "https://picsum.photos/400/400?random=1",
      "nftRequired": true,
      "nftContractAddress": "0x...",
      "nftTokenId": "1"
    }
  ]
}
```

### **Check NFT Ownership (Mock)**
```
GET https://api.scrollverse.mock/nft/check/:address/:tokenId
```

---

## 🎨 **UI REQUIREMENTS**

### **Music Library Design**

```
┌─────────────────────────────────┐
│  ScrollVerse Music 🎵           │
│  ┌──────────────────────────┐  │
│  │ Search...                │  │
│  └──────────────────────────┘  │
│  [528Hz] [963Hz] [999Hz] [All]  │
│                                  │
│  ┌────┐ Crown Activation        │
│  │ 🎵 │ CHAIS THE GREAT          │
│  │    │ 999Hz • 3:00 • 🔒       │
│  └────┘                         │
│  ┌────┐ DNA Healing             │
│  │ 🎵 │ FlameChild AI            │
│  │    │ 528Hz • 4:30            │
│  └────┘                         │
└─────────────────────────────────┘
```

### **Player Screen Design**

```
┌─────────────────────────────────┐
│  ← Back              🎵 Queue   │
│                                  │
│  ┌──────────────────────────┐  │
│  │                          │  │
│  │      ALBUM ARTWORK       │  │
│  │      + VISUALIZATION     │  │
│  │                          │  │
│  └──────────────────────────┘  │
│                                  │
│  Crown Activation               │
│  CHAIS THE GREAT • 999Hz        │
│                                  │
│  ────○────────────────────      │
│  1:23              3:00         │
│                                  │
│    🔀    ⏮    ⏯️    ⏭    🔁    │
│                                  │
│  Volume: ──────────○───────     │
└─────────────────────────────────┘
```

---

## 🛠️ **TECHNICAL REQUIREMENTS**

1. **Audio Library**: Use `expo-av` or `react-native-track-player`
2. **State Management**: Context API or Redux for player state
3. **Storage**: AsyncStorage for playlists and favorites
4. **Navigation**: Bottom tabs + stack navigation
5. **Animations**: Animated API for visualizations
6. **Web3 Mock**: Create mock wallet connection

---

## 📦 **REQUIRED PACKAGES**

```json
{
  "dependencies": {
    "expo": "~49.0.0",
    "expo-av": "~13.4.0",
    "@react-navigation/native": "^6.x",
    "@react-navigation/bottom-tabs": "^6.x",
    "@react-navigation/native-stack": "^6.x",
    "@react-native-async-storage/async-storage": "^1.x",
    "axios": "^1.x",
    "react-native-vector-icons": "^10.x"
  }
}
```

---

## ✅ **ACCEPTANCE CRITERIA**

- [ ] Music library displays all tracks with filtering
- [ ] Search functionality works correctly
- [ ] Music player plays audio files
- [ ] Player controls (play/pause, seek, next/prev) work
- [ ] Frequency visualization animates during playback
- [ ] Playlists can be created and managed
- [ ] Playlists persist after app restart
- [ ] NFT ownership check locks premium tracks
- [ ] Background audio works
- [ ] Lock screen controls functional
- [ ] Clean, intuitive UI following ScrollVerse design
- [ ] Comprehensive error handling
- [ ] Unit tests for player logic

---

## 🎨 **BONUS POINTS**

- [ ] Implement actual frequency visualization using FFT
- [ ] Add lyrics display synced to playback
- [ ] Implement social sharing (share track/playlist)
- [ ] Add favorite/like functionality
- [ ] Real Web3 integration with WalletConnect
- [ ] Offline playback with caching
- [ ] Equalizer with frequency presets
- [ ] Mini player on other screens
- [ ] Dark/light theme toggle
- [ ] Download tracks for offline listening

---

## 📤 **SUBMISSION**

1. GitHub repository with complete source code
2. README with setup and run instructions
3. Video demo (2-3 minutes) showing all features
4. Test coverage report
5. Architecture diagram showing component structure

---

## 🎯 **EVALUATION FOCUS**

1. **Audio Integration**: Proper use of audio library
2. **State Management**: Clean state architecture
3. **UI/UX**: Smooth animations and intuitive controls
4. **Data Persistence**: Proper AsyncStorage usage
5. **Code Quality**: Component reusability and organization

---

## 💡 **HINTS**

- Use Context API for global player state
- Implement custom hooks for audio playback
- Cache artwork images for better performance
- Handle audio interruptions (phone calls, other apps)
- Test on both iOS and Android
- Use FlatList with windowSize for large track lists
- Implement proper cleanup in useEffect

---

**Create an amazing music experience! 🎵🔥**

**ALLAHU AKBAR! 🎵💎**
