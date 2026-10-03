import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
type Props = {
  mode?: "solid" | "wire" | "points";
  model?: string;
  label?: string;
  interactive?: boolean;
  fallback?: string;
};
export default function PartScene({
  mode = "solid",
  model = "fixture",
  label = "Temsili 3D model",
  interactive = false,
  fallback = "/brand/industrial/fixture.webp",
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const actions = useRef<{
    reset: () => void;
    zoom: (factor: number) => void;
    turn: (step: number) => void;
  }>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let renderer: THREE.WebGLRenderer;
    setStatus("loading");
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      setStatus("error");
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    element.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x526476, 3));
    for (const [color, intensity, pos] of [
      [0xffffff, 4, [-4, 6, 5]],
      [0xb4d5ff, 2, [4, 3, -3]],
    ] as const) {
      const l = new THREE.DirectionalLight(color, intensity);
      l.position.set(pos[0], pos[1], pos[2]);
      scene.add(l);
    }
    const pivot = new THREE.Group();
    scene.add(pivot);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = interactive;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = false;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = Math.PI * 0.8;
    renderer.domElement.style.touchAction = "pan-y";
    const geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>();
    let distance = 8;
    let visible = true;
    let observer: IntersectionObserver | undefined;
    const draw = () => {
      if (!disposed && visible) renderer.render(scene, camera);
    };
    const fit = () => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      draw();
    };
    const reset = () => {
      distance = window.innerWidth < 600 ? 8.7 : 8;
      camera.position.set(1, 0.72, 1.1).normalize().multiplyScalar(distance);
      controls.target.set(0, 0, 0);
      pivot.rotation.set(0, -0.2, 0);
      controls.update();
      draw();
    };
    reset();
    actions.current = {
      reset,
      zoom: (factor) => {
        distance = THREE.MathUtils.clamp(
          camera.position.length() * factor,
          4.3,
          13,
        );
        camera.position.normalize().multiplyScalar(distance);
        controls.update();
        draw();
      },
      turn: (step) => {
        pivot.rotation.y += step;
        draw();
      },
    };
    controls.addEventListener("change", draw);
    const resize = new ResizeObserver(fit);
    resize.observe(element);
    const contextLost = (event: Event) => {
      event.preventDefault();
      setStatus("error");
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    // Only fetch/render a gallery when it approaches the viewport.
    let started = false;
    const load = () => {
      if (started) return;
      started = true;
      new GLTFLoader().load(
        `/models/${model}.glb`,
        (gltf) => {
          const root = gltf.scene;
          root.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              geometries.add(obj.geometry);
              for (const m of Array.isArray(obj.material)
                ? obj.material
                : [obj.material])
                materials.add(m);
            }
          });
          if (disposed) {
            geometries.forEach((g) => g.dispose());
            materials.forEach((m) => m.dispose());
            return;
          }
          root.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(root),
            size = box.getSize(new THREE.Vector3()),
            center = box.getCenter(new THREE.Vector3());
          const scale = 4.3 / Math.max(size.x, size.y, size.z);
          root.position.copy(center).multiplyScalar(-scale);
          root.scale.setScalar(scale);
          if (mode !== "solid") {
            let meshCount = 0;
            root.traverse((o) => {
              if (o instanceof THREE.Mesh) meshCount++;
            });
            const replacements: {
              original: THREE.Mesh;
              object: THREE.Object3D;
            }[] = [];
            root.traverse((o) => {
              if (!(o instanceof THREE.Mesh)) return;
              let object: THREE.Object3D;
              if (mode === "wire") {
                const geo = new THREE.EdgesGeometry(o.geometry, 25);
                const mat = new THREE.LineBasicMaterial({
                  color: 0x4c7280,
                  transparent: true,
                  opacity: 0.7,
                });
                geometries.add(geo);
                materials.add(mat);
                object = new THREE.LineSegments(geo, mat);
              } else {
                const sampler = new MeshSurfaceSampler(o).build();
                const count = Math.max(80, Math.floor(18000 / meshCount)),
                  positions = new Float32Array(count * 3),
                  v = new THREE.Vector3();
                for (let i = 0; i < count; i++) {
                  sampler.sample(v);
                  v.toArray(positions, i * 3);
                }
                const geo = new THREE.BufferGeometry();
                geo.setAttribute(
                  "position",
                  new THREE.BufferAttribute(positions, 3),
                );
                const mat = new THREE.PointsMaterial({
                  color: 0xb57540,
                  size: 0.017,
                });
                geometries.add(geo);
                materials.add(mat);
                object = new THREE.Points(geo, mat);
              }
              object.position.copy(o.position);
              object.quaternion.copy(o.quaternion);
              object.scale.copy(o.scale);
              replacements.push({ original: o, object });
            });
            replacements.forEach(({ original, object }) => {
              original.parent?.add(object);
              original.removeFromParent();
            });
          }
          pivot.add(root);
          setStatus("ready");
          fit();
          draw();
        },
        undefined,
        () => {
          if (!disposed) setStatus("error");
        },
      );
    };
    observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) {
          load();
          draw();
        }
      },
      { rootMargin: "180px" },
    );
    observer.observe(element);
    fit();
    return () => {
      disposed = true;
      actions.current = undefined;
      observer?.disconnect();
      resize.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [model, mode, interactive, attempt]);
  return (
    <div
      className={`model-view ${interactive ? "is-interactive" : ""}`}
      data-model={model}
      data-model-status={status}
    >
      <div
        className="part-scene"
        ref={host}
        role={interactive ? "group" : "img"}
        aria-label={label}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={(e) => {
          if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
            actions.current?.turn(e.key === "ArrowLeft" ? -0.2 : 0.2);
          }
        }}
      />
      {status === "loading" && (
        <div className="model-status" role="status">
          <span className="model-loader" />
          3D model hazırlanıyor
        </div>
      )}
      {status === "error" && (
        <div className="model-fallback">
          <img src={fallback} alt={label} />
          <span>3D görünüm açılamadı.</span>
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>
            Yeniden dene
          </button>
        </div>
      )}
      {interactive && status === "ready" && (
        <>
          <span className="model-hint">Sürükleyerek döndürün</span>
          <div className="model-controls">
            <button
              type="button"
              aria-label="Modeli uzaklaştır"
              onClick={() => actions.current?.zoom(1.15)}
            >
              <ZoomOut size={18} />
            </button>
            <button
              type="button"
              aria-label="Modeli yakınlaştır"
              onClick={() => actions.current?.zoom(0.85)}
            >
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              aria-label="Model görünümünü sıfırla"
              onClick={() => actions.current?.reset()}
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
