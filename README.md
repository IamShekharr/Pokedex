# Pokédex App 🔴⚪

A feature-rich Pokédex mobile app built with React Native, Expo & TypeScript — powered by Anthropic Claude AI.

## Features
- Browse 150+ Pokemon with infinite scroll
- AI-generated Pokemon bio (English & Hindi)
- AI Battle Mode — Claude decides the winner with stats comparison
- Evolution chain
- Type matchups (strong/weak)
- Swipe gesture — change type filter
- Skeleton loader
- Dark mode support
- Pokemon cry sound

## Tech Stack
- React Native + Expo
- TypeScript
- Expo Router (file-based navigation)
- PokeAPI
- Anthropic Claude API
- AsyncStorage

## Setup
1. Clone the repo
   git clone https://github.com/YOUR_USERNAME/pokedex.git
   cd pokedex

2. Install dependencies
   npm install

3. Add API key — .env file banao
   EXPO_PUBLIC_CLAUDE_API_KEY=your_key_here

4. Run
   npx expo start
```

---

### Step 2 — .gitignore check karo

`.gitignore` file mein yeh sab hona chahiye:
```
node_modules/
.expo/
.env
*.log