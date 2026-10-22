// Lightweight beeps via Web Audio API — skips bundling audio files for three sounds.
let ctx: AudioContext | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function beep(freq: number, durationMs: number, type: OscillatorType = "sine") {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + durationMs / 1000);
}

export const playMoveSound = () => beep(440, 90);
export const playCaptureSound = () => beep(260, 110, "square");
export const playGameOverSound = () => beep(180, 400, "sawtooth");
