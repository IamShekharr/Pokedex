// ✅ Kab use karte hain?
// Claude API calls alag service mein — key change ho toh sirf yahan

export async function callClaude(prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  return data.content
    .map((item: any) => (item.type === "text" ? item.text : ""))
    .join("");
}

export async function generatePokemonBio(
  name: string,
  types: string,
  topStat: string,
  topStatVal: number,
  height: number,
  weight: number
): Promise<{ en: string; hi: string }> {
  const text = await callClaude(
    `Write a fun 25-30 word bio for Pokemon "${name}".
Type: ${types}. Best stat: ${topStat} (${topStatVal}).
Height: ${height}m, Weight: ${weight}kg.
Respond ONLY with JSON, no backticks:
{"en": "english bio", "hi": "hindi bio"}`
  );
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

export async function generateBattleStory(
  name: string,
  types: string,
  topStat: string,
  topStatVal: number
): Promise<{ story_en: string; story_hi: string }> {
  const text = await callClaude(
    `Pokemon "${name}" is ${types} type. Best stat: ${topStat} (${topStatVal}).
Write a fun 30-word battle story — mention 1 Pokemon it defeats and 1 it struggles against.
Respond ONLY with JSON, no backticks:
{"story_en": "english story", "story_hi": "hindi story"}`
  );
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}