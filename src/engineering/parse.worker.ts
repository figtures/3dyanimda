import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
self.onmessage = ({
  data,
}: MessageEvent<{ buffer: ArrayBuffer; extension: string }>) => {
  try {
    const geometry =
      data.extension === "ply"
        ? new PLYLoader().parse(data.buffer)
        : new STLLoader().parse(data.buffer);
    const source = geometry.index ? geometry.toNonIndexed() : geometry;
    const position = source.getAttribute("position");
    if (!position || position.count < 3 || position.count > 1800000)
      throw new Error(
        "Model 3–1.800.000 köşe arasında olmalıdır. Daha hafif bir dosya deneyin.",
      );
    const positions = new Float32Array(position.array);
    if (!positions.every(Number.isFinite))
      throw new Error("Dosyada geçersiz koordinatlar var.");
    const header = new TextDecoder()
      .decode(data.buffer.slice(0, 65536))
      .split("end_header")[0];
    const isPoints =
      data.extension === "ply" && !/element\s+face\s+[1-9][0-9]*/.test(header);
    source.computeBoundingBox();
    const box = source.boundingBox!;
    if (
      Math.max(
        box.max.x - box.min.x,
        box.max.y - box.min.y,
        box.max.z - box.min.z,
      ) <= 0
    )
      throw new Error("Modelin boyutu sıfır.");
    const colors = source.getAttribute("color")
      ? new Float32Array(source.getAttribute("color").array)
      : undefined;
    self.postMessage(
      {
        positions,
        colors,
        isPoints,
        bounds: [box.min.toArray(), box.max.toArray()],
      },
      {
        transfer: colors
          ? [positions.buffer, colors.buffer]
          : [positions.buffer],
      },
    );
    source.dispose();
    geometry.dispose();
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "Dosya okunamadı.",
    });
  }
};
