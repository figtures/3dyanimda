import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ImageCropperProps {
  src: string;
  aspect: number;
  outputWidth: number;
  outputHeight: number;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
}

async function getCroppedBlob(src: string, area: Area, w: number, h: number): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);
  return await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png", 0.95));
}

export const ImageCropper = ({ src, aspect, outputWidth, outputHeight, onCancel, onCropped }: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const handleConfirm = async () => {
    if (!area) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(src, area, outputWidth, outputHeight);
      onCropped(blob);
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full bg-muted rounded-lg overflow-hidden" style={{ height: 320 }}>
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onComplete}
          objectFit="contain"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Zoom</label>
        <Slider value={[zoom]} min={1} max={3} step={0.01} onValueChange={(v) => setZoom(v[0])} />
      </div>
      <div className="text-xs text-muted-foreground">Çıktı: {outputWidth}×{outputHeight} px PNG</div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={busy}>İptal</Button>
        <Button onClick={handleConfirm} disabled={busy || !area}>{busy ? "Kırpılıyor..." : "Kaydet"}</Button>
      </div>
    </div>
  );
};