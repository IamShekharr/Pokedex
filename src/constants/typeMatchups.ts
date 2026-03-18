export const typeMatchups: Record<string, {
  strong: string[];
  weak: string[];
}> = {
  normal:   { strong: [],                              weak: ["fighting"] },
  fire:     { strong: ["grass","ice","bug","steel"],   weak: ["water","ground","rock"] },
  water:    { strong: ["fire","ground","rock"],        weak: ["grass","electric"] },
  electric: { strong: ["water","flying"],              weak: ["ground"] },
  grass:    { strong: ["water","ground","rock"],       weak: ["fire","ice","flying","bug"] },
  ice:      { strong: ["grass","ground","flying"],     weak: ["fire","fighting","rock","steel"] },
  fighting: { strong: ["normal","ice","rock","dark"],  weak: ["flying","psychic","fairy"] },
  poison:   { strong: ["grass","fairy"],               weak: ["ground","psychic"] },
  ground:   { strong: ["fire","electric","poison"],    weak: ["water","grass","ice"] },
  flying:   { strong: ["grass","fighting","bug"],      weak: ["electric","ice","rock"] },
  psychic:  { strong: ["fighting","poison"],           weak: ["bug","ghost","dark"] },
  bug:      { strong: ["grass","psychic","dark"],      weak: ["fire","flying","rock"] },
  rock:     { strong: ["fire","ice","flying","bug"],   weak: ["water","grass","fighting","ground"] },
  ghost:    { strong: ["psychic","ghost"],             weak: ["ghost","dark"] },
  dragon:   { strong: ["dragon"],                      weak: ["ice","dragon","fairy"] },
  dark:     { strong: ["psychic","ghost"],             weak: ["fighting","bug","fairy"] },
  steel:    { strong: ["ice","rock","fairy"],          weak: ["fire","fighting","ground"] },
  fairy:    { strong: ["fighting","dragon","dark"],    weak: ["poison","steel"] },
};