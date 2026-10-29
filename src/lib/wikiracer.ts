// Curated pairs of well-linked, recognizable articles so the daily puzzle is
// always solvable in a reasonable number of clicks (unlike two fully random
// articles, which can be obscure or disconnected).
const DAILY_PAIRS: [string, string][] = [
  ["Albert Einstein", "Pizza"],
  ["Great Wall of China", "Basketball"],
  ["Leonardo da Vinci", "Internet"],
  ["Mount Everest", "Coffee"],
  ["William Shakespeare", "Electric guitar"],
  ["Eiffel Tower", "Chocolate"],
  ["Isaac Newton", "Bicycle"],
  ["Amazon rainforest", "Smartphone"],
  ["Napoleon", "Jazz"],
  ["Great Barrier Reef", "Chess"],
  ["Marie Curie", "Olympic Games"],
  ["Sahara", "Television"],
  ["Charles Darwin", "Sushi"],
  ["Statue of Liberty", "Volcano"],
  ["Wolfgang Amadeus Mozart", "Formula One"],
  ["Nile", "Penguin"],
  ["Cleopatra", "Skateboarding"],
  ["Mount Fuji", "Guitar"],
  ["Julius Caesar", "Pizza"],
  ["Niagara Falls", "Astronaut"],
  ["Vincent van Gogh", "Coffee"],
  ["Great Pyramid of Giza", "Robot"],
  ["Genghis Khan", "Ice cream"],
  ["Mahatma Gandhi", "Basketball"],
  ["Stonehenge", "Rock and roll"],
  ["Christopher Columbus", "Chocolate"],
  ["Mariana Trench", "Chess"],
  ["Abraham Lincoln", "Video game"],
  ["Taj Mahal", "Jazz"],
  ["Alexander the Great", "Sushi"],
];

const EPOCH = new Date("2026-01-01T00:00:00Z").getTime();
const DAY_MS = 86_400_000;

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dailyPair(dateKey: string): [string, string] {
  const days = Math.floor((new Date(`${dateKey}T00:00:00Z`).getTime() - EPOCH) / DAY_MS);
  const index = ((days % DAILY_PAIRS.length) + DAILY_PAIRS.length) % DAILY_PAIRS.length;
  return DAILY_PAIRS[index];
}
