export const PRINT_LAYERS = 72;
export const PRINT_SEGMENTS = 96;
export const PRINT_HEIGHT = 1.86;
export const BED_HEIGHT = .56;
export const PRINT_SECONDS = 43;
export const PRINT_CYCLE = 51;

/** One original fluted form, shared by the deposited wall and the nozzle path. */
export function printPoint(height: number, angle: number) {
  const t = Math.max(0, Math.min(1, height));
  const radius = .47 + .14 * Math.sin(t * Math.PI) - .055 * Math.sin(t * Math.PI * 2);
  const flute = .047 * Math.cos(angle * 12 - t * 4.8);
  return { x: (radius + flute) * Math.cos(angle), y: BED_HEIGHT + t * PRINT_HEIGHT, z: (radius + flute) * Math.sin(angle) };
}

const smooth = (n: number, a: number, b: number) => { const t = Math.max(0, Math.min(1, (n - a) / (b - a))); return t * t * (3 - 2 * t); };

export function printFrame(elapsed: number) {
  const t = ((elapsed % PRINT_CYCLE) + PRINT_CYCLE) % PRINT_CYCLE;
  const progress = Math.min(1, t / PRINT_SECONDS);
  const phase = t < PRINT_SECONDS ? "printing" : t < 48 ? "complete" : "reset";
  const reset = (t - 48) / 3;
  const headProgress = phase === "reset" ? 1 - smooth(reset, .35, 1) : progress;
  const angle = headProgress * PRINT_LAYERS * Math.PI * 2;
  return {
    phase,
    progress,
    head: printPoint(headProgress, angle),
    opacity: phase === "reset" ? 1 - smooth(reset, 0, .3) : 1,
    lift: phase === "complete" ? .18 * smooth(t, PRINT_SECONDS, PRINT_SECONDS + .8) : phase === "reset" ? .18 * (1 - smooth(reset, .35, 1)) : 0,
    layer: Math.min(PRINT_LAYERS, Math.floor(progress * PRINT_LAYERS)),
  } as const;
}
