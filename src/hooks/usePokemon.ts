// ✅ Kab use karte hain?
// Jab component mein bahut saara fetch logic ho
// Hook mein daalo — component clean rahe

import { useState } from "react";
import { fetchPokemonDetail, fetchPokemonList } from "../services/pokeApi";

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  imageBack: string;
  types: { type: { name: string } }[];
}

export function usePokemonList() {
  const [pokemons, setPokemons]       = useState<Pokemon[]>([]);
  const [loading, setLoading]         = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset]           = useState(0);
  const [hasMore, setHasMore]         = useState(true);

  async function fetchPokemons(currentOffset: number) {
    if (currentOffset === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await fetchPokemonList(20, currentOffset);
      if (!data.next) setHasMore(false);

      const detailed = await Promise.all(
        data.results.map(async (p) => {
          const detail = await fetchPokemonDetail(p.name);
          return detail;
        })
      );

      setPokemons((prev) =>
        currentOffset === 0 ? detailed : [...prev, ...detailed]
      );
      setOffset(currentOffset + 20);
    } catch (e) {
      console.log("usePokemon error:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function loadMore() {
    if (!loadingMore && hasMore) fetchPokemons(offset);
  }

  return {
    pokemons,
    loading,
    loadingMore,
    hasMore,
    fetchPokemons,
    loadMore,
  };
}