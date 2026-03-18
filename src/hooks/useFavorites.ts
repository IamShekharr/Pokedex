// ✅ Kab use karte hain AsyncStorage?
// Data app band hone ke baad bhi rehna chahiye → AsyncStorage

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const FAVORITES_KEY = "pokemon_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // ✅ App open hone pe saved favorites load karo
  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      const saved = await AsyncStorage.getItem(FAVORITES_KEY);
      if (saved) setFavorites(JSON.parse(saved));
    } catch (e) {
      console.log("Load favorites error:", e);
    }
  }

  async function toggleFavorite(name: string) {
    try {
      const updated = favorites.includes(name)
        ? favorites.filter((f) => f !== name)  // remove
        : [...favorites, name];                 // add

      setFavorites(updated);
      // ✅ AsyncStorage mein save karo
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.log("Toggle favorite error:", e);
    }
  }

  function isFavorite(name: string): boolean {
    return favorites.includes(name);
  }

  return { favorites, toggleFavorite, isFavorite };
}