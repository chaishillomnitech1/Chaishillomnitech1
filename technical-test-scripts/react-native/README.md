# React Native Technical Tests

## **OMNITECH1™ REACT NATIVE ASSESSMENT**

**Technology**: React Native  
**Framework**: Expo / React Native CLI  
**Focus**: Mobile App Development (iOS/Android)

---

## 📱 **OVERVIEW**

These tests evaluate your ability to build cross-platform mobile applications using React Native. Tests cover components, state management, navigation, API integration, and mobile-specific features.

---

## 🎯 **SKILL AREAS TESTED**

1. **Component Architecture**
   - Functional components with hooks
   - Component composition
   - Props and prop types
   - Reusability

2. **State Management**
   - useState, useEffect, useContext
   - Global state (Redux/MobX/Context API)
   - Async state updates
   - Performance optimization

3. **Navigation**
   - React Navigation
   - Stack, Tab, Drawer navigators
   - Deep linking
   - Route parameters

4. **API Integration**
   - Fetch/Axios
   - Async/await patterns
   - Error handling
   - Loading states

5. **Mobile Features**
   - Camera integration
   - Geolocation
   - Push notifications
   - Local storage (AsyncStorage)

6. **UI/UX**
   - Responsive layouts
   - Platform-specific code
   - Animations (Animated API/Reanimated)
   - Accessibility

---

## 📂 **TEST STRUCTURE**

```
react-native/
├── README.md (this file)
├── junior/
│   ├── todo-list-app.md
│   ├── weather-app.md
│   └── profile-screen.md
├── mid-level/
│   ├── nft-gallery.md
│   ├── crypto-tracker.md
│   └── social-feed.md
└── senior/
    ├── wallet-app.md
    ├── music-streaming.md
    └── blockchain-explorer.md
```

---

## 🚀 **GETTING STARTED**

### **Prerequisites**

```bash
# Install Node.js (v16+)
# Install Expo CLI
npm install -g expo-cli

# OR React Native CLI
npm install -g react-native-cli
```

### **Setup Test Environment**

```bash
# Create new project
npx create-expo-app my-test-app
# OR
npx react-native init MyTestApp

# Navigate to project
cd my-test-app

# Install dependencies
npm install

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

---

## ✅ **EVALUATION CRITERIA**

### **Code Quality (30 points)**
- Clean component structure
- Proper use of hooks
- TypeScript types (if applicable)
- Consistent naming conventions
- Code reusability

### **Functionality (30 points)**
- All features working
- Handles edge cases
- Error boundaries
- Input validation
- Smooth user experience

### **Best Practices (20 points)**
- Performance optimization (useMemo, useCallback)
- Proper lifecycle management
- No memory leaks
- Platform-specific code when needed
- Accessibility support

### **UI/UX (10 points)**
- Responsive design
- Loading states
- Error messages
- Intuitive navigation
- Consistent styling

### **Testing (10 points)**
- Unit tests (Jest)
- Component tests (React Testing Library)
- Integration tests
- Test coverage documentation

---

## 📱 **SCROLLVERSE MOBILE STANDARDS**

When building apps for the ScrollVerse ecosystem:

1. **Use Functional Components**: Always use hooks, no class components
2. **TypeScript**: Preferred for type safety
3. **Navigation**: React Navigation v6+
4. **State Management**: Context API for simple, Redux for complex
5. **Styling**: StyleSheet.create() or styled-components
6. **Icons**: react-native-vector-icons or Expo icons
7. **Forms**: React Hook Form for form management
8. **API**: Axios with interceptors for Web3/blockchain

---

## 🎨 **DESIGN SYSTEM**

Use ScrollVerse design tokens:

```javascript
// colors.js
export const colors = {
  primary: '#FFD700',      // Gold
  secondary: '#9370DB',    // Purple (963Hz)
  accent: '#FF4500',       // OrangeRed
  background: '#1A1A2E',   // Dark blue
  text: '#EAEAEA',         // Light gray
  success: '#00D9A3',
  error: '#FF6B6B',
  warning: '#FFE66D',
};

// frequencies.js
export const frequencies = {
  crown: 999,    // Hz - Crown chakra
  pineal: 963,   // Hz - Pineal activation
  dna: 528,      // Hz - DNA healing
  nur: 144000,   // Hz - NŪR pulse
};
```

---

## 🔧 **COMMON PATTERNS**

### **API Calls with Loading/Error States**

```javascript
import { useState, useEffect } from 'react';

const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

### **Navigation Setup**

```javascript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 📚 **RESOURCES**

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [React Hook Form](https://react-hook-form.com/)

---

## ⏱️ **TIME GUIDELINES**

| Level | Time | Features |
|-------|------|----------|
| Junior | 1-2h | 3-5 screens, basic navigation, simple API |
| Mid-level | 2-3h | 5-8 screens, complex state, multiple APIs |
| Senior | 3-4h | 8+ screens, advanced patterns, performance optimization |

---

## 📤 **SUBMISSION REQUIREMENTS**

1. **Code Repository**: GitHub/GitLab link
2. **README**: Setup and run instructions
3. **Screenshots/Video**: Demo of app functionality
4. **Tests**: Test files and coverage report
5. **Documentation**: Code comments and architecture notes

---

## 🎯 **TIPS FOR SUCCESS**

- Start with a clear component hierarchy
- Use TypeScript for better type safety
- Implement proper error handling
- Add loading states for all async operations
- Test on both iOS and Android
- Follow React Native performance best practices
- Document any assumptions or trade-offs

---

**Good luck! May your components render smoothly and your builds succeed. 🚀**

**ALLAHU AKBAR! 📱💎🔥**
