import { useEffect, useRef, useState } from "react";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
export type ModelData = {
  positions: Float32Array;
  colors?: Float32Array;
  isPoints: boolean;
  bounds: number[][];
};
export default function Viewer({
  model,
  mode,
  axis,
  section,
  cutting,
}: {
  model: ModelData;
  mode: string;
  axis: string;
  section: number;
  cutting: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const update =
    useRef<
      (mode: string, axis: string, section: number, cutting: boolean) => void
    >();
  const reset = useRef<() => void>();
  const turn = useRef<(n: number) => void>();
  const zoom = useRef<(n: number) => void>();
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const el = host.current!;
    let renderer: T.WebGLRenderer;
    setError(false);
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setError(true);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.localClippingEnabled = true;
    el.appendChild(renderer.domElement);
    const scene = new T.Scene(),
      camera = new T.PerspectiveCamera(38, 1, 0.01, 100);
    scene.add(new T.HemisphereLight(0xffffff, 0x36506a, 3));
    const light = new T.DirectionalLight(0xffffff, 4);
    light.position.set(3, 5, 4);
    scene.add(light);
    const geometry = new T.BufferGeometry();
    geometry.setAttribute(
      "position",
      new T.BufferAttribute(model.positions, 3),
    );
    if (model.colors)
      geometry.setAttribute("color", new T.BufferAttribute(model.colors, 3));
    geometry.computeBoundingBox();
    const size = geometry.boundingBox!.getSize(new T.Vector3());
    const scale = 4 / Math.max(size.x, size.y, size.z);
    geometry.center();
    geometry.scale(scale, scale, scale);
    if (!model.isPoints) geometry.computeVertexNormals();
    const plane = new T.Plane(new T.Vector3(-1, 0, 0), 0);
    const material = new T.MeshStandardMaterial({
      color: 0x83b8c9,
      metalness: 0.25,
      roughness: 0.36,
      side: T.DoubleSide,
      vertexColors: !!model.colors,
    });
    const pointMaterial = new T.PointsMaterial({
      color: model.colors ? 0xffffff : 0x55dcb6,
      size: 0.022,
      vertexColors: !!model.colors,
    });
    const mesh = new T.Mesh(geometry, material),
      points = new T.Points(geometry, pointMaterial);
    scene.add(mesh, points);
    const helper = new T.PlaneHelper(plane, 4.8, 0x68efc2);
    scene.add(helper);
    const grid = new T.GridHelper(8, 24, 0x365563, 0x223a47);
    grid.position.y = (-size.y * scale) / 2 - 0.1;
    scene.add(grid);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    renderer.domElement.style.touchAction = "pan-y";
    const draw = () => renderer.render(scene, camera);
    reset.current = () => {
      camera.position.set(6, 4, 6);
      controls.target.set(0, 0, 0);
      controls.update();
      draw();
    };
    reset.current();
    turn.current = (n) => {
      camera.position.applyAxisAngle(new T.Vector3(0, 1, 0), n);
      controls.update();
      draw();
    };
    zoom.current = (n) => {
      camera.position.setLength(
        T.MathUtils.clamp(camera.position.length() * n, 3, 18),
      );
      controls.update();
      draw();
    };
    update.current = (m, a, s, c) => {
      const index = ["X", "Y", "Z"].indexOf(a);
      plane.normal.set(
        index === 0 ? -1 : 0,
        index === 1 ? -1 : 0,
        index === 2 ? -1 : 0,
      );
      plane.constant = (s / 100 - 0.5) * size.getComponent(index) * scale;
      material.clippingPlanes = c ? [plane] : [];
      pointMaterial.clippingPlanes = c ? [plane] : [];
      material.needsUpdate = true;
      pointMaterial.needsUpdate = true;
      mesh.visible = !model.isPoints && m !== "points";
      points.visible = model.isPoints || m === "points";
      material.wireframe = m === "wire";
      helper.visible = c;
      draw();
    };
    update.current(mode, axis, section, cutting);
    controls.addEventListener("change", draw);
    const observer = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      draw();
    });
    observer.observe(el);
    const lost = (e: Event) => {
      e.preventDefault();
      setError(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      observer.disconnect();
      controls.dispose();
      geometry.dispose();
      material.dispose();
      pointMaterial.dispose();
      grid.geometry.dispose();
      (grid.material as T.Material).dispose();
      helper.traverse((o) => {
        if (o instanceof T.Mesh || o instanceof T.Line) {
          o.geometry.dispose();
          for (const m of Array.isArray(o.material) ? o.material : [o.material])
            m.dispose();
        }
      });
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      update.current = undefined;
    };
  }, [model, retry]);
  useEffect(
    () => update.current?.(mode, axis, section, cutting),
    [mode, axis, section, cutting],
  );
  return (
    <div
      className="engineering-viewport"
      data-viewer-state={error ? "error" : "ready"}
    >
      <div
        ref={host}
        className="engineering-canvas"
        role="group"
        tabIndex={0}
        aria-label="3D model. Döndürmek için sağ ve sol ok tuşlarını kullanın."
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            turn.current?.(e.key === "ArrowLeft" ? -0.2 : 0.2);
          }
        }}
      />
      {error ? (
        <div className="engineering-overlay" role="alert">
          3D görünüm açılamadı.
          <button onClick={() => setRetry((n) => n + 1)}>Yeniden dene</button>
        </div>
      ) : (
        <>
          <span className="engineering-axis">
            X / Y / Z <b>MODEL SPACE</b>
          </span>
          <div className="engineering-camera">
            <button aria-label="Uzaklaştır" onClick={() => zoom.current?.(1.2)}>
              −
            </button>
            <button
              aria-label="Yakınlaştır"
              onClick={() => zoom.current?.(0.8)}
            >
              +
            </button>
            <button onClick={() => reset.current?.()}>Görünümü sıfırla</button>
          </div>
        </>
      )}
    </div>
  );
}
