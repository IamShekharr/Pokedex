// ✅ Kab use karte hain?
// API calls ek jagah rakho — URL change ho toh sirf yahan badlo

const BASE_URL = "https://pokeapi.co/api/v2";

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  image: string;
  imageBack: string;
  types: { type: { name: string } }[];
  height: number;
  weight: number;
  stats: { base_stat: number; stat: { name: string } }[];
  base_experience: number;
}

export interface EvolutionStage {
  id: number;
  name: string;
  image: string;
}

// Pokemon list fetch
export async function fetchPokemonList(
  limit: number,
  offset: number
): Promise<{ results: PokemonListItem[]; next: string | null }> {
  const res  = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  return res.json();
}

// Single pokemon detail fetch
export async function fetchPokemonDetail(
  nameOrId: string | number
): Promise<PokemonDetail> {
  const res     = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
  const data    = await res.json();
  return {
    id:              data.id,
    name:            data.name,
    image:           data.sprites.front_default,
    imageBack:       data.sprites.back_default,
    types:           data.types,
    height:          data.height,
    weight:          data.weight,
    stats:           data.stats,
    base_experience: data.base_experience,
  };
}

// ✅ Evolution chain fetch
// KYUN? 3 API calls lagti hain — species → evolution chain → har stage ka detail
export async function fetchEvolutionChain(
  pokemonName: string
): Promise<EvolutionStage[]> {
  // Step 1: Species se evolution chain URL lo
  const speciesRes  = await fetch(`${BASE_URL}/pokemon-species/${pokemonName}`);
  const speciesData = await speciesRes.json();

  // Step 2: Evolution chain fetch karo
  const evoRes  = await fetch(speciesData.evolution_chain.url);
  const evoData = await evoRes.json();

  // Step 3: Chain se names nikalo
  const names: string[] = [];
  let current = evoData.chain;

  // ✅ While loop — chain traverse karo
  // KYUN? Evolution chain linked list jaisi hoti hai
  while (current) {
    names.push(current.species.name);
    current = current.evolves_to[0];
  }

  // Step 4: Har stage ka image fetch karo parallel
  const stages = await Promise.all(
    names.map(async (name) => {
      const res  = await fetch(`${BASE_URL}/pokemon/${name}`);
      const data = await res.json();
      return {
        id:    data.id,
        name:  data.name,
        image: data.sprites.front_default,
      };
    })
  );

  return stages;
}

// ✅ Pokemon cry URL
// KYUN? PokeAPI mein actual sound files hain — free!
export function getPokemonCryUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
}