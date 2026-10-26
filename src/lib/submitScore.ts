// fire-and-forget: the server silently no-ops this if nobody's logged in,
// so game components never need to check auth state before calling it
export function submitScore(game: string, metric: string, value: number) {
  fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game, metric, value }),
  }).catch(() => {
    // best-effort; losing a score submission isn't worth surfacing an error
  });
}
