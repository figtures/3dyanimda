export const MODEL_EXTENSIONS = ['stl', 'obj', '3mf', 'step', 'stp', 'iges', 'igs'] as const;
export type ModelExtension = typeof MODEL_EXTENSIONS[number];
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_TRIANGLES = 500_000;
export const MAX_PARTS = 2_000;
export type ModelPart = { positions: Float32Array; colors?: Float32Array; name: string; color?: [number, number, number] };
export type ModelMetrics = {
  volumeCm3: number;
  bboxCm: { x: number; y: number; z: number };
  surfaceCm2: number;
  triangles: number;
  parts: number;
  format: string;
  unitAssumed: boolean;
  closed: boolean;
};
export type ImportedModel = { parts: ModelPart[]; metrics: ModelMetrics; warnings: string[] };
export function modelExtension(name: string): ModelExtension {
  const ext = name.split('.').pop()?.toLowerCase();
  if (!MODEL_EXTENSIONS.includes(ext as ModelExtension)) throw new Error('STL, OBJ, 3MF, STEP/STP veya IGES/IGS seçin.');
  return ext as ModelExtension;
}
